import React from 'react'
import ReactDOM from 'react-dom'

import { mount } from 'enzyme'

import Transition, {
  UNMOUNTED,
  EXITED,
  ENTERING,
  ENTERED,
  EXITING,
} from '../src/Transition'

expect.extend({
  toExist(received) {
    const pass = received != null
    return pass ? {
      message: () => `expected ${received} to be null or undefined`,
      pass: true,
    } : {
      message: () => `expected ${received} not to be null or undefined`,
      pass: false,
    }
  },
})

describe('Transition', () => {
  it('should not transition on mount', () => {
    let wrapper = mount(
      <Transition
        in
        timeout={0}
        onEnter={() => {
          throw new Error('should not Enter')
        }}
      >
        <div />
      </Transition>
    )

    expect(wrapper.state('status')).toEqual(ENTERED)
  })

  it('should transition on mount with `appear`', done => {
    mount(
      <Transition
        in
        timeout={0}
        onEnter={() => {
          throw Error('Animated!')
        }}
      >
        <div />
      </Transition>
    )

    mount(
      <Transition in appear timeout={0} onEnter={() => done()}>
        <div />
      </Transition>
    )
  })

  it('should pass filtered props to children', () => {
    class Child extends React.Component {
      render() {
        return <div>child</div>
      }
    }
    const child = mount(
      <Transition
        foo="foo"
        bar="bar"
        in
        mountOnEnter
        unmountOnExit
        appear
        enter
        exit
        timeout={0}
        addEndListener={() => {}}
        onEnter={() => {}}
        onEntering={() => {}}
        onEntered={() => {}}
        onExit={() => {}}
        onExiting={() => {}}
        onExited={() => {}}
      >
        <Child />
      </Transition>
    ).find(Child)

    expect(child.props()).toEqual({ foo: 'foo', bar: 'bar' })
  })

  it('should allow addEndListener instead of timeouts', done => {
    let listener = jest.fn((node, end) => setTimeout(end, 0))

    let inst = mount(
      <Transition
        addEndListener={listener}
        onEntered={() => {
          expect(listener).toHaveBeenCalledTimes(1)
          done()
        }}
      >
        <div />
      </Transition>
    )

    inst.setProps({ in: true })
  })

  it('should fallback to timeouts with addEndListener', done => {
    let calledEnd = false
    let listener = (node, end) =>
      setTimeout(() => {
        calledEnd = true
        end()
      }, 100)

    let inst = mount(
      <Transition
        timeout={0}
        addEndListener={listener}
        onEntered={() => {
          expect(calledEnd).toEqual(false)
          done()
        }}
      >
        <div />
      </Transition>
    )

    inst.setProps({ in: true })
  })

  it('should mount/unmount immediately if not have enter/exit timeout', (done) => {
    const wrapper = mount(
      <Transition in={true} timeout={{}}>
        <div />
      </Transition>
    )

    expect(wrapper.state('status')).toEqual(ENTERED)
    let calledAfterTimeout = false
    setTimeout(() => {
      calledAfterTimeout = true
    }, 10)
    wrapper.setProps({
      in: false,
      onExited() {
        expect(wrapper.state('status')).toEqual(EXITED)
        if (!calledAfterTimeout) {
          return done()
        }
        throw new Error('wrong timeout')
      }
    })
  })

  describe('appearing timeout', () => {
    it('should use enter timeout if appear not set', done => {
      let calledBeforeEntered = false
      setTimeout(() => {
        calledBeforeEntered = true
      }, 10)
      const wrapper = mount(
        <Transition in={true} timeout={{ enter: 20, exit: 10 }} appear>
          <div />
        </Transition>
      )

      wrapper.setProps({
        onEntered() {
          if (calledBeforeEntered) {
            done()
          } else {
            throw new Error('wrong timeout')
          }
        },
      })
    })

    it('should use appear timeout if appear is set', done => {
      const wrapper = mount(
        <Transition in={true} timeout={{ enter: 20, exit: 10, appear: 5 }} appear>
          <div />
        </Transition>
      )

      let isCausedLate = false
      setTimeout(() => {
        isCausedLate = true
      }, 15)

      wrapper.setProps({
        onEntered() {
          if (isCausedLate) {
            throw new Error('wrong timeout')
          } else {
            done()
          }
        }
      })
    })
  })

  describe('entering', () => {
    let wrapper

    beforeEach(() => {
      wrapper = mount(
        <Transition timeout={10}>
          <div />
        </Transition>
      )
    })

    it('should fire callbacks', done => {
      let callOrder = []
      let onEnter = jest.fn(() => callOrder.push('onEnter'))
      let onEntering = jest.fn(() => callOrder.push('onEntering'))

      expect(wrapper.state('status')).toEqual(EXITED)

      wrapper.setProps({
        in: true,

        onEnter,

        onEntering,

        onEntered() {
          expect(onEnter).toHaveBeenCalledTimes(1)
          expect(onEntering).toHaveBeenCalledTimes(1)
          expect(callOrder).toEqual(['onEnter', 'onEntering'])
          done()
        },
      })
    })

    it('should move to each transition state', done => {
      let count = 0

      expect(wrapper.state('status')).toEqual(EXITED)

      wrapper.setProps({
        in: true,

        onEnter() {
          count++
          expect(wrapper.state('status')).toEqual(EXITED)
        },

        onEntering() {
          count++
          expect(wrapper.state('status')).toEqual(ENTERING)
        },

        onEntered() {
          expect(wrapper.state('status')).toEqual(ENTERED)
          expect(count).toEqual(2)
          done()
        },
      })
    })
  })

  describe('exiting', () => {
    let wrapper

    beforeEach(() => {
      wrapper = mount(
        <Transition in timeout={10}>
          <div />
        </Transition>
      )
    })

    it('should fire callbacks', done => {
      let callOrder = []
      let onExit = jest.fn(() => callOrder.push('onExit'))
      let onExiting = jest.fn(() => callOrder.push('onExiting'))

      expect(wrapper.state('status')).toEqual(ENTERED)

      wrapper.setProps({
        in: false,

        onExit,

        onExiting,

        onExited() {
          expect(onExit).toHaveBeenCalledTimes(1)
          expect(onExiting).toHaveBeenCalledTimes(1)
          expect(callOrder).toEqual(['onExit', 'onExiting'])
          done()
        },
      })
    })

    it('should move to each transition state', done => {
      let count = 0

      expect(wrapper.state('status')).toEqual(ENTERED)

      wrapper.setProps({
        in: false,

        onExit() {
          count++
          expect(wrapper.state('status')).toEqual(ENTERED)
        },

        onExiting() {
          count++
          expect(wrapper.state('status')).toEqual(EXITING)
        },

        onExited() {
          expect(wrapper.state('status')).toEqual(EXITED)
          expect(count).toEqual(2)
          done()
        },
      })
    })
  })

  describe('mountOnEnter', () => {
    class MountTransition extends React.Component {
      constructor(props) {
        super(props)
        this.state = { in: props.initialIn }
      }

      render() {
        const { ...props } = this.props
        delete props.initialIn

        return (
          <Transition
            ref={transition => this.transition = this.transition || transition}
            mountOnEnter
            in={this.state.in}
            timeout={10}
            {...props}
          >
            <div />
          </Transition>
        )
      }

      getStatus = () => {
        return this.transition.state.status
      }
    }

    it('should mount when entering', done => {
      const wrapper = mount(
        <MountTransition
          initialIn={false}
          onEnter={() => {
            expect(wrapper.instance().getStatus()).toEqual(EXITED)
            expect(wrapper.getDOMNode()).toExist()
            done()
          }}
        />
      )

      expect(wrapper.instance().getStatus()).toEqual(UNMOUNTED)

      expect(wrapper.getDOMNode()).not.toExist()

      wrapper.setProps({ in: true })
    })

    it('should stay mounted after exiting', done => {
      const wrapper = mount(
        <MountTransition
          initialIn={false}
          onEntered={() => {
            expect(wrapper.instance().getStatus()).toEqual(ENTERED)
            expect(wrapper.getDOMNode()).toExist()

            wrapper.setState({ in: false })
          }}
          onExited={() => {
            expect(wrapper.instance().getStatus()).toEqual(EXITED)
            expect(wrapper.getDOMNode()).toExist()

            done()
          }}
        />
      )

      expect(wrapper.getDOMNode()).not.toExist()
      wrapper.setState({ in: true })
    })
  })

  describe('unmountOnExit', () => {
    class UnmountTransition extends React.Component {
      constructor(props) {
        super(props)

        this.state = { in: props.initialIn }
      }

      render() {
        const { ...props } = this.props
        delete props.initialIn

        return (
          <Transition
            ref={transition => this.transition = this.transition || transition}
            unmountOnExit
            in={this.state.in}
            timeout={10}
            {...props}
          >
            <div />
          </Transition>
        )
      }

      getStatus = () => {
        return this.transition.state.status
      }
    }

    it('should mount when entering', done => {
      const wrapper = mount(
        <UnmountTransition
          initialIn={false}
          onEnter={() => {
            expect(wrapper.getStatus()).toEqual(EXITED)
            expect(ReactDOM.findDOMNode(wrapper)).toExist()

            done()
          }}
        />
      ).instance()

      expect(wrapper.getStatus()).toEqual(UNMOUNTED)
      expect(ReactDOM.findDOMNode(wrapper)).toBeNull()

      wrapper.setState({ in: true })
    })

    it('should unmount after exiting', done => {
      const wrapper = mount(
        <UnmountTransition
          initialIn
          onExited={() => {
            setTimeout(() => {
              expect(wrapper.getStatus()).toEqual(UNMOUNTED)
              expect(ReactDOM.findDOMNode(wrapper)).not.toExist()
              done()
            })
          }}
        />
      ).instance()

      expect(wrapper.getStatus()).toEqual(ENTERED)
      expect(ReactDOM.findDOMNode(wrapper)).toExist()

      wrapper.setState({ in: false })
    })
  })

  describe('findDOMNode', () => {
    it('uses ReactDOM.findDOMNode by default', done => {
      const expectDiv = jest.fn(node => expect(node.nodeName).toEqual('DIV'));
      const handleExited = () => {
        expect(expectDiv).toHaveBeenCalled()

        done();
      }

      const wrapper = mount(
        <Transition
          in
          timeout={10}
          onExiting={expectDiv}
          onExited={handleExited}
        >
          {status => <div><span>{status}</span></div>}
        </Transition>
      );

      wrapper.setProps({ in: false });
    })

    it('can receive a custom findDOMNode method', done => {
      class StrictModeTransition extends React.Component {
        constructor(props) {
          super(props);
          this.childRef = React.createRef();
          this.findDOMNode = this.findDOMNode.bind(this);
        }

        findDOMNode() {
          return this.childRef.current;
        }

        render() {
          return (
            <Transition findDOMNode={this.findDOMNode} {...this.props}>
              {status => <div><span ref={this.childRef}>{status}</span></div>}
            </Transition>
          );
        }
      }

      const expectSpan = jest.fn(node => expect(node.nodeName).toEqual('SPAN'));
      const handleExited = () => {
        expect(expectSpan).toHaveBeenCalled();

        done();
      }

      const wrapper = mount(
        <StrictModeTransition
          in
          timeout={10}
          onExiting={expectSpan}
          onExited={handleExited}
        />
      );

      wrapper.setProps({ in: false });
    })
  })
})
