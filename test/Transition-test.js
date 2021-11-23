import React from 'react';
import ReactDOM from 'react-dom';

import { render } from './utils';

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
  // beforeEach(() => {
  //   jest.useFakeTimers();
  // });

  // afterEach(() => {
  //   jest.useRealTimers();
  // });

  it('should not transition on mount', () => {
    const nodeRef = React.createRef();
    render(
      <Transition
        in
        nodeRef={nodeRef}
        timeout={0}
        onEnter={() => {
          throw new Error('should not Enter');
        }}
      >
        {(status) => <div ref={nodeRef}>status: {status}</div>}
      </Transition>
    );

    expect(nodeRef.current.textContent).toEqual(`status: ${ENTERED}`);
  });

  it('should transition on mount with `appear`', (done) => {
    const nodeRef = React.createRef();
    render(
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

    render(
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
        return (
          <div ref={this.props.nodeRef}>
            foo: {this.props.foo}, bar: {this.props.bar}
          </div>
        );
      }
    }
    const nodeRef = React.createRef();
    render(
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
    );

    expect(nodeRef.current.textContent).toBe('foo: foo, bar: bar');
  });

  it('should allow addEndListener instead of timeouts', (done) => {
    let listener = jest.fn((end) => setTimeout(end, 0));

    const nodeRef = React.createRef();
    const { setProps } = render(
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

    setProps({ in: true });
  });

  it('should fallback to timeouts with addEndListener', (done) => {
    let calledEnd = false;
    let listener = (end) =>
      setTimeout(() => {
        calledEnd = true;
        end();
      }, 100);

    const nodeRef = React.createRef();
    const { setProps } = render(
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

    setProps({ in: true });
  });

  it('should mount/unmount immediately if not have enter/exit timeout', (done) => {
    const nodeRef = React.createRef();
    const { setProps } = render(
      <Transition nodeRef={nodeRef} in={true} timeout={{}}>
        {(status) => <div ref={nodeRef}>status: {status}</div>}
      </Transition>
    );

    expect(nodeRef.current.textContent).toEqual(`status: ${ENTERED}`);
    let calledAfterTimeout = false;
    setTimeout(() => {
      calledAfterTimeout = true;
    }, 10);
    setProps({
      in: false,
      onExited() {
        expect(nodeRef.current.textContent).toEqual(`status: ${EXITED}`);
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

    render(
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
    render(
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
      const { setProps } = render(
        <Transition
          nodeRef={nodeRef}
          in={true}
          timeout={{ enter: 20, exit: 10 }}
          appear
        >
          <div ref={nodeRef} />
        </Transition>
      );

      setProps({
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
      const { setProps } = render(
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

      setProps({
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
    it('should fire callbacks', (done) => {
      let callOrder = [];
      let onEnter = jest.fn(() => callOrder.push('onEnter'));
      let onEntering = jest.fn(() => callOrder.push('onEntering'));
      const nodeRef = React.createRef();
      const { setProps } = render(
        <Transition nodeRef={nodeRef} timeout={10}>
          {(status) => <div ref={nodeRef}>status: {status}</div>}
        </Transition>
      );

      expect(nodeRef.current.textContent).toEqual(`status: ${EXITED}`);

      setProps({
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
      const nodeRef = React.createRef();
      const { setProps } = render(
        <Transition nodeRef={nodeRef} timeout={10}>
          {(status) => <div ref={nodeRef}>status: {status}</div>}
        </Transition>
      );

      expect(nodeRef.current.textContent).toEqual(`status: ${EXITED}`);

      setProps({
        in: true,

        onEnter() {
          count++;
          expect(nodeRef.current.textContent).toEqual(`status: ${EXITED}`);
        },

        onEntering() {
          count++;
          expect(nodeRef.current.textContent).toEqual(`status: ${ENTERING}`);
        },

        onEntered() {
          expect(nodeRef.current.textContent).toEqual(`status: ${ENTERED}`);
          expect(count).toEqual(2);
          done();
        },
      });
    });
  });

  describe('exiting', () => {
    it('should fire callbacks', (done) => {
      let callOrder = [];
      let onExit = jest.fn(() => callOrder.push('onExit'));
      let onExiting = jest.fn(() => callOrder.push('onExiting'));
      const nodeRef = React.createRef();
      const { setProps } = render(
        <Transition nodeRef={nodeRef} in timeout={10}>
          {(status) => <div ref={nodeRef}>status: {status}</div>}
        </Transition>
      );

      expect(nodeRef.current.textContent).toEqual(`status: ${ENTERED}`);

      setProps({
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
      const nodeRef = React.createRef();
      const { setProps } = render(
        <Transition nodeRef={nodeRef} in timeout={10}>
          {(status) => <div ref={nodeRef}>status: {status}</div>}
        </Transition>
      );

      expect(nodeRef.current.textContent).toEqual(`status: ${ENTERED}`);

      setProps({
        in: false,

        onExit() {
          count++;
          expect(nodeRef.current.textContent).toEqual(`status: ${ENTERED}`);
        },

        onExiting() {
          count++;
          expect(nodeRef.current.textContent).toEqual(`status: ${EXITING}`);
        },

        onExited() {
          expect(nodeRef.current.textContent).toEqual(`status: ${EXITED}`);
          expect(count).toEqual(2);
          done();
        },
      });
    });
  });

  describe('mountOnEnter', () => {
    class MountTransition extends React.Component {
      nodeRef = React.createRef();

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
            in={this.props.in}
            timeout={10}
            {...props}
          >
            {(status) => <div ref={this.nodeRef}>status: {status}</div>}
          </Transition>
        );
      }

      getStatus = () => {
        return this.transition.state.status;
      };
    }

    it('should mount when entering', (done) => {
      const { container, setProps } = render(
        <MountTransition
          in={false}
          onEnter={() => {
            expect(container.textContent).toEqual(`status: ${EXITED}`);
            done();
          }}
        />
      );

      expect(container.textContent).toEqual('');

      setProps({ in: true });
    });

    it('should stay mounted after exiting', (done) => {
      const { container, setProps } = render(
        <MountTransition
          in={false}
          onEntered={() => {
            expect(container.textContent).toEqual(`status: ${ENTERED}`);

            setProps({ in: false });
          }}
          onExited={() => {
            expect(container.textContent).toEqual(`status: ${EXITED}`);

            done();
          }}
        />
      );

      expect(container.textContent).toEqual('');
      setProps({ in: true });
    });
  });

  describe('unmountOnExit', () => {
    class UnmountTransition extends React.Component {
      nodeRef = React.createRef();

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
            in={this.props.in}
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
      const instanceRef = React.createRef();
      const { setProps } = render(
        <UnmountTransition
          ref={instanceRef}
          in={false}
          onEnter={() => {
            expect(instanceRef.current.getStatus()).toEqual(EXITED);
            expect(instanceRef.current.nodeRef.current).toExist();

            done();
          }}
        />
      );

      expect(instanceRef.current.getStatus()).toEqual(UNMOUNTED);
      expect(instanceRef.current.nodeRef.current).toBeNull();

      setProps({ in: true });
    });

    it('should unmount after exiting', (done) => {
      const instanceRef = React.createRef();
      const { setProps } = render(
        <UnmountTransition
          ref={instanceRef}
          in
          onExited={() => {
            setTimeout(() => {
              expect(instanceRef.current.getStatus()).toEqual(UNMOUNTED);
              expect(instanceRef.current.nodeRef.current).not.toExist();
              done();
            });
          }}
        />
      );

      expect(instanceRef.current.getStatus()).toEqual(ENTERED);
      expect(instanceRef.current.nodeRef.current).toExist();

      setProps({ in: false });
    });
  });
});
