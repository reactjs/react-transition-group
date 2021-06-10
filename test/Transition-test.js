import React from 'react';
import ReactDOM from 'react-dom';

import { mount } from 'enzyme';

import Transition, {
  UNMOUNTED,
  EXITED,
  ENTERING,
  ENTERED,
  EXITING,
} from '../src/Transition';

expect.extend({
  toExist(received) {
    const pass = received != null;
    return pass
      ? {
          message: () => `expected ${received} to be null or undefined`,
          pass: true,
        }
      : {
          message: () => `expected ${received} not to be null or undefined`,
          pass: false,
        };
  },
});

describe('Transition', () => {
  it('should not transition on mount', () => {
    const nodeRef = React.createRef();
    let wrapper = mount(
      <Transition
        in
        nodeRef={nodeRef}
        timeout={0}
        onEnter={() => {
          throw new Error('should not Enter');
        }}
      >
        <div ref={nodeRef} />
      </Transition>
    );

    expect(wrapper.state('status')).toEqual(ENTERED);
  });

  it('should transition on mount with `appear`', (done) => {
    const nodeRef = React.createRef();
    mount(
      <Transition
        in
        nodeRef={nodeRef}
        timeout={0}
        onEnter={() => {
          throw Error('Animated!');
        }}
      >
        <div ref={nodeRef} />
      </Transition>
    );

    mount(
      <Transition
        nodeRef={nodeRef}
        in
        appear
        timeout={0}
        onEnter={() => done()}
      >
        <div ref={nodeRef} />
      </Transition>
    );
  });

  it('should pass filtered props to children', () => {
    class Child extends React.Component {
      render() {
        return <div ref={this.props.nodeRef}>child</div>;
      }
    }
    const nodeRef = React.createRef();
    const child = mount(
      <Transition
        foo="foo"
        bar="bar"
        in
        nodeRef={nodeRef}
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
        <Child nodeRef={nodeRef} />
      </Transition>
    ).find(Child);

    expect(child.props()).toEqual({ foo: 'foo', bar: 'bar', nodeRef });
  });

  it('should allow addEndListener instead of timeouts', (done) => {
    let listener = jest.fn((end) => setTimeout(end, 0));

    const nodeRef = React.createRef();
    let wrapper = mount(
      <Transition
        nodeRef={nodeRef}
        addEndListener={listener}
        onEntered={() => {
          expect(listener).toHaveBeenCalledTimes(1);
          done();
        }}
      >
        <div ref={nodeRef} />
      </Transition>
    );

    wrapper.setProps({ in: true });
  });

  it('should fallback to timeouts with addEndListener', (done) => {
    let calledEnd = false;
    let listener = (end) =>
      setTimeout(() => {
        calledEnd = true;
        end();
      }, 100);

    const nodeRef = React.createRef();
    let wrapper = mount(
      <Transition
        timeout={0}
        nodeRef={nodeRef}
        addEndListener={listener}
        onEntered={() => {
          expect(calledEnd).toEqual(false);
          done();
        }}
      >
        <div ref={nodeRef} />
      </Transition>
    );

    wrapper.setProps({ in: true });
  });

  it('should mount/unmount immediately if not have enter/exit timeout', (done) => {
    const nodeRef = React.createRef();
    const wrapper = mount(
      <Transition nodeRef={nodeRef} in={true} timeout={{}}>
        <div ref={nodeRef} />
      </Transition>
    );

    expect(wrapper.state('status')).toEqual(ENTERED);
    let calledAfterTimeout = false;
    setTimeout(() => {
      calledAfterTimeout = true;
    }, 10);
    wrapper.setProps({
      in: false,
      onExited() {
        expect(wrapper.state('status')).toEqual(EXITED);
        if (!calledAfterTimeout) {
          return done();
        }
        throw new Error('wrong timeout');
      },
    });
  });

  it('should use `React.findDOMNode` when `nodeRef` is not provided', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const findDOMNodeSpy = jest.spyOn(ReactDOM, 'findDOMNode');

    mount(
      <Transition in appear timeout={0}>
        <div />
      </Transition>
    );

    expect(findDOMNodeSpy).toHaveBeenCalled();
    findDOMNodeSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('should not use `React.findDOMNode` when `nodeRef` is provided', () => {
    const findDOMNodeSpy = jest.spyOn(ReactDOM, 'findDOMNode');

    const nodeRef = React.createRef();
    mount(
      <Transition nodeRef={nodeRef} in appear timeout={0}>
        <div ref={nodeRef} />
      </Transition>
    );

    expect(findDOMNodeSpy).not.toHaveBeenCalled();
    findDOMNodeSpy.mockRestore();
  });

  describe('appearing timeout', () => {
    it('should use enter timeout if appear not set', (done) => {
      let calledBeforeEntered = false;
      setTimeout(() => {
        calledBeforeEntered = true;
      }, 10);
      const nodeRef = React.createRef();
      const wrapper = mount(
        <Transition
          nodeRef={nodeRef}
          in={true}
          timeout={{ enter: 20, exit: 10 }}
          appear
        >
          <div ref={nodeRef} />
        </Transition>
      );

      wrapper.setProps({
        onEntered() {
          if (calledBeforeEntered) {
            done();
          } else {
            throw new Error('wrong timeout');
          }
        },
      });
    });

    it('should use appear timeout if appear is set', (done) => {
      const nodeRef = React.createRef();
      const wrapper = mount(
        <Transition
          nodeRef={nodeRef}
          in={true}
          timeout={{ enter: 20, exit: 10, appear: 5 }}
          appear
        >
          <div ref={nodeRef} />
        </Transition>
      );

      let isCausedLate = false;
      setTimeout(() => {
        isCausedLate = true;
      }, 15);

      wrapper.setProps({
        onEntered() {
          if (isCausedLate) {
            throw new Error('wrong timeout');
          } else {
            done();
          }
        },
      });
    });
  });

  describe('entering', () => {
    let wrapper, nodeRef;

    beforeEach(() => {
      nodeRef = React.createRef();
      wrapper = mount(
        <Transition nodeRef={nodeRef} timeout={10}>
          <div ref={nodeRef} />
        </Transition>
      );
    });

    it('should fire callbacks', (done) => {
      let callOrder = [];
      let onEnter = jest.fn(() => callOrder.push('onEnter'));
      let onEntering = jest.fn(() => callOrder.push('onEntering'));

      expect(wrapper.state('status')).toEqual(EXITED);

      wrapper.setProps({
        in: true,

        onEnter,

        onEntering,

        onEntered() {
          expect(onEnter).toHaveBeenCalledTimes(1);
          expect(onEntering).toHaveBeenCalledTimes(1);
          expect(callOrder).toEqual(['onEnter', 'onEntering']);
          done();
        },
      });
    });

    it('should move to each transition state', (done) => {
      let count = 0;

      expect(wrapper.state('status')).toEqual(EXITED);

      wrapper.setProps({
        in: true,

        onEnter() {
          count++;
          expect(wrapper.state('status')).toEqual(EXITED);
        },

        onEntering() {
          count++;
          expect(wrapper.state('status')).toEqual(ENTERING);
        },

        onEntered() {
          expect(wrapper.state('status')).toEqual(ENTERED);
          expect(count).toEqual(2);
          done();
        },
      });
    });
  });

  describe('exiting', () => {
    let wrapper, nodeRef;

    beforeEach(() => {
      nodeRef = React.createRef();
      wrapper = mount(
        <Transition nodeRef={nodeRef} in timeout={10}>
          <div ref={nodeRef} />
        </Transition>
      );
    });

    it('should fire callbacks', (done) => {
      let callOrder = [];
      let onExit = jest.fn(() => callOrder.push('onExit'));
      let onExiting = jest.fn(() => callOrder.push('onExiting'));

      expect(wrapper.state('status')).toEqual(ENTERED);

      wrapper.setProps({
        in: false,

        onExit,

        onExiting,

        onExited() {
          expect(onExit).toHaveBeenCalledTimes(1);
          expect(onExiting).toHaveBeenCalledTimes(1);
          expect(callOrder).toEqual(['onExit', 'onExiting']);
          done();
        },
      });
    });

    it('should move to each transition state', (done) => {
      let count = 0;

      expect(wrapper.state('status')).toEqual(ENTERED);

      wrapper.setProps({
        in: false,

        onExit() {
          count++;
          expect(wrapper.state('status')).toEqual(ENTERED);
        },

        onExiting() {
          count++;
          expect(wrapper.state('status')).toEqual(EXITING);
        },

        onExited() {
          expect(wrapper.state('status')).toEqual(EXITED);
          expect(count).toEqual(2);
          done();
        },
      });
    });
  });

  describe('mountOnEnter', () => {
    class MountTransition extends React.Component {
      nodeRef = React.createRef();
      state = { in: this.props.initialIn };

      render() {
        const { ...props } = this.props;
        delete props.initialIn;

        return (
          <Transition
            ref={(transition) =>
              (this.transition = this.transition || transition)
            }
            nodeRef={this.nodeRef}
            mountOnEnter
            in={this.state.in}
            timeout={10}
            {...props}
          >
            <div ref={this.nodeRef} />
          </Transition>
        );
      }

      getStatus = () => {
        return this.transition.state.status;
      };
    }

    it('should mount when entering', (done) => {
      const wrapper = mount(
        <MountTransition
          initialIn={false}
          onEnter={() => {
            expect(wrapper.instance().getStatus()).toEqual(EXITED);
            expect(wrapper.instance().nodeRef.current).toExist();
            done();
          }}
        />
      );

      expect(wrapper.instance().getStatus()).toEqual(UNMOUNTED);

      expect(wrapper.instance().nodeRef.current).not.toExist();

      wrapper.setProps({ in: true });
    });

    it('should stay mounted after exiting', (done) => {
      const wrapper = mount(
        <MountTransition
          initialIn={false}
          onEntered={() => {
            expect(wrapper.instance().getStatus()).toEqual(ENTERED);
            expect(wrapper.instance().nodeRef.current).toExist();

            wrapper.setState({ in: false });
          }}
          onExited={() => {
            expect(wrapper.instance().getStatus()).toEqual(EXITED);
            expect(wrapper.instance().nodeRef.current).toExist();

            done();
          }}
        />
      );

      expect(wrapper.instance().nodeRef.current).not.toExist();
      wrapper.setState({ in: true });
    });
  });

  describe('unmountOnExit', () => {
    class UnmountTransition extends React.Component {
      nodeRef = React.createRef();
      state = { in: this.props.initialIn };

      render() {
        const { ...props } = this.props;
        delete props.initialIn;

        return (
          <Transition
            ref={(transition) =>
              (this.transition = this.transition || transition)
            }
            nodeRef={this.nodeRef}
            unmountOnExit
            in={this.state.in}
            timeout={10}
            {...props}
          >
            <div ref={this.nodeRef} />
          </Transition>
        );
      }

      getStatus = () => {
        return this.transition.state.status;
      };
    }

    it('should mount when entering', (done) => {
      const instance = mount(
        <UnmountTransition
          initialIn={false}
          onEnter={() => {
            expect(instance.getStatus()).toEqual(EXITED);
            expect(instance.nodeRef.current).toExist();

            done();
          }}
        />
      ).instance();

      expect(instance.getStatus()).toEqual(UNMOUNTED);
      expect(instance.nodeRef.current).toBeNull();

      instance.setState({ in: true });
    });

    it('should unmount after exiting', (done) => {
      const instance = mount(
        <UnmountTransition
          initialIn
          onExited={() => {
            setTimeout(() => {
              expect(instance.getStatus()).toEqual(UNMOUNTED);
              expect(instance.nodeRef.current).not.toExist();
              done();
            });
          }}
        />
      ).instance();

      expect(instance.getStatus()).toEqual(ENTERED);
      expect(instance.nodeRef.current).toExist();

      instance.setState({ in: false });
    });
  });
});
