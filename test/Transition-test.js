import React from 'react'
import ReactDOM from 'react-dom'

import { mount } from 'enzyme'
import sinon from 'sinon'

import Transition, {
  UNMOUNTED,
  EXITED,
  ENTERING,
  ENTERED,
  EXITING,
} from '../src/Transition'

jasmine.addMatchers({
  toExist: () => ({
    compare: actual => ({
      pass: actual != null,
    }),
  }),
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
    let listener = sinon.spy((node, end) => setTimeout(end, 0))

    let inst = mount(
      <Transition
        addEndListener={listener}
        onEntered={() => {
          expect(listener.callCount).toEqual(1)
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
      let onEnter = sinon.spy()
      let onEntering = sinon.spy()

      expect(wrapper.state('status')).toEqual(EXITED)

      wrapper.setProps({
        in: true,

        onEnter,

        onEntering,

        onEntered() {
          expect(onEnter.calledOnce).toEqual(true)
          expect(onEntering.calledOnce).toEqual(true)
          expect(onEnter.calledBefore(onEntering)).toEqual(true)
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
      let onExit = sinon.spy()
      let onExiting = sinon.spy()

      expect(wrapper.state('status')).toEqual(ENTERED)

      wrapper.setProps({
        in: false,

        onExit,

        onExiting,

        onExited() {
          expect(onExit.calledOnce).toEqual(true)
          expect(onExiting.calledOnce).toEqual(true)
          expect(onExit.calledBefore(onExiting)).toEqual(true)
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
            ref="transition"
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
        return this.refs.transition.state.status
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
            ref="transition"
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
        return this.refs.transition.state.status
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
})
