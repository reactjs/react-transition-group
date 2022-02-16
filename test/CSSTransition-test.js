import React from 'react';
import { render, waitFor } from './utils';

import CSSTransition from '../src/CSSTransition';
import TransitionGroup from '../src/TransitionGroup';

describe('CSSTransition', () => {
  it('should flush new props to the DOM before initiating a transition', (done) => {
    const nodeRef = React.createRef();
    const { setProps } = render(
      <CSSTransition
        in={false}
        nodeRef={nodeRef}
        timeout={0}
        classNames="test"
        onEnter={() => {
          expect(nodeRef.current.classList.contains('test-class')).toEqual(
            true
          );
          expect(nodeRef.current.classList.contains('test-entering')).toEqual(
            false
          );
          done();
        }}
      >
        <div ref={nodeRef} />
      </CSSTransition>
    );

    expect(nodeRef.current.classList.contains('test-class')).toEqual(false);

    setProps({
      in: true,
      className: 'test-class',
    });
  });

  describe('entering', () => {
    it('should apply classes at each transition state', async () => {
      let count = 0;
      let done = false;
      const nodeRef = React.createRef();
      const { setProps } = render(
        <CSSTransition nodeRef={nodeRef} timeout={10} classNames="test">
          <div ref={nodeRef} />
        </CSSTransition>
      );

      setProps({
        in: true,

        onEnter() {
          count++;
          expect(nodeRef.current.className).toEqual('test-enter');
        },

        onEntering() {
          count++;
          expect(nodeRef.current.className).toEqual(
            'test-enter test-enter-active'
          );
        },

        onEntered() {
          expect(nodeRef.current.className).toEqual('test-enter-done');
          expect(count).toEqual(2);
          done = true;
        },
      });

      await waitFor(() => {
        expect(done).toBe(true);
      });
    });

    it('should apply custom classNames names', async () => {
      let count = 0;
      const nodeRef = React.createRef();
      const { setProps } = render(
        <CSSTransition
          timeout={10}
          nodeRef={nodeRef}
          classNames={{
            enter: 'custom',
            enterActive: 'custom-super-active',
            enterDone: 'custom-super-done',
          }}
        >
          <div ref={nodeRef} />
        </CSSTransition>
      );

      setProps({
        in: true,

        onEnter() {
          count++;
          expect(nodeRef.current.className).toEqual('custom');
        },

        onEntering() {
          count++;
          expect(nodeRef.current.className).toEqual(
            'custom custom-super-active'
          );
        },

        onEntered() {
          expect(nodeRef.current.className).toEqual('custom-super-done');
        },
      });

      await waitFor(() => {
        expect(count).toEqual(2);
      });
    });
  });

  describe('appearing', () => {
    it('should apply appear classes at each transition state', async () => {
      let count = 0;
      const nodeRef = React.createRef();
      render(
        <CSSTransition
          timeout={10}
          nodeRef={nodeRef}
          classNames="appear-test"
          in={true}
          appear={true}
          onEnter={(isAppearing) => {
            count++;
            expect(isAppearing).toEqual(true);
            expect(nodeRef.current.className).toEqual('appear-test-appear');
          }}
          onEntering={(isAppearing) => {
            count++;
            expect(isAppearing).toEqual(true);
            expect(nodeRef.current.className).toEqual(
              'appear-test-appear appear-test-appear-active'
            );
          }}
          onEntered={(isAppearing) => {
            expect(isAppearing).toEqual(true);
            expect(nodeRef.current.className).toEqual(
              'appear-test-appear-done appear-test-enter-done'
            );
          }}
        >
          <div ref={nodeRef} />
        </CSSTransition>
      );

      await waitFor(() => {
        expect(count).toEqual(2);
      });
    });

    it('should lose the "*-appear-done" class after leaving and entering again', async () => {
      const nodeRef = React.createRef();
      let entered = false;
      let exited = false;
      const { setProps } = render(
        <CSSTransition
          timeout={10}
          nodeRef={nodeRef}
          classNames="appear-test"
          in={true}
          appear={true}
          onEntered={() => {
            entered = true;
          }}
        >
          <div ref={nodeRef} />
        </CSSTransition>
      );

      await waitFor(() => {
        expect(entered).toEqual(true);
      });
      setProps({
        in: false,
        onEntered: () => {},
        onExited: () => {
          exited = true;
        },
      });

      await waitFor(() => {
        expect(exited).toEqual(true);
      });
      expect(nodeRef.current.className).toBe('appear-test-exit-done');
      entered = false;
      setProps({
        in: true,
        onEntered: () => {
          entered = true;
        },
      });

      await waitFor(() => {
        expect(entered).toEqual(true);
      });
      expect(nodeRef.current.className).toBe('appear-test-enter-done');
    });

    it('should not add undefined when appearDone is not defined', async () => {
      const nodeRef = React.createRef();
      let done = false;
      render(
        <CSSTransition
          timeout={10}
          nodeRef={nodeRef}
          classNames={{ appear: 'appear-test' }}
          in={true}
          appear={true}
          onEnter={(isAppearing) => {
            expect(isAppearing).toEqual(true);
            expect(nodeRef.current.className).toEqual('appear-test');
          }}
          onEntered={(isAppearing) => {
            expect(isAppearing).toEqual(true);
            expect(nodeRef.current.className).toEqual('');
            done = true;
          }}
        >
          <div ref={nodeRef} />
        </CSSTransition>
      );

      await waitFor(() => {
        expect(done).toEqual(true);
      });
    });

    it('should not be appearing in normal enter mode', async () => {
      let count = 0;
      const nodeRef = React.createRef();
      render(
        <CSSTransition
          timeout={10}
          nodeRef={nodeRef}
          classNames="not-appear-test"
          appear={true}
        >
          <div ref={nodeRef} />
        </CSSTransition>
      ).setProps({
        in: true,

        onEnter(isAppearing) {
          count++;
          expect(isAppearing).toEqual(false);
          expect(nodeRef.current.className).toEqual('not-appear-test-enter');
        },

        onEntering(isAppearing) {
          count++;
          expect(isAppearing).toEqual(false);
          expect(nodeRef.current.className).toEqual(
            'not-appear-test-enter not-appear-test-enter-active'
          );
        },

        onEntered(isAppearing) {
          expect(isAppearing).toEqual(false);
          expect(nodeRef.current.className).toEqual(
            'not-appear-test-enter-done'
          );
        },
      });

      await waitFor(() => {
        expect(count).toEqual(2);
      });
    });

    it('should not enter the transition states when appear=false', () => {
      const nodeRef = React.createRef();
      render(
        <CSSTransition
          timeout={10}
          nodeRef={nodeRef}
          classNames="appear-fail-test"
          in={true}
          appear={false}
          onEnter={() => {
            throw Error('Enter called!');
          }}
          onEntering={() => {
            throw Error('Entring called!');
          }}
          onEntered={() => {
            throw Error('Entred called!');
          }}
        >
          <div ref={nodeRef} />
        </CSSTransition>
      );
    });
  });

  describe('exiting', () => {
    it('should apply classes at each transition state', async () => {
      let count = 0;
      const nodeRef = React.createRef();
      const { setProps } = render(
        <CSSTransition in nodeRef={nodeRef} timeout={10} classNames="test">
          <div ref={nodeRef} />
        </CSSTransition>
      );

      setProps({
        in: false,

        onExit() {
          count++;
          expect(nodeRef.current.className).toEqual('test-exit');
        },

        onExiting() {
          count++;
          expect(nodeRef.current.className).toEqual(
            'test-exit test-exit-active'
          );
        },

        onExited() {
          expect(nodeRef.current.className).toEqual('test-exit-done');
        },
      });

      await waitFor(() => {
        expect(count).toEqual(2);
      });
    });

    it('should apply custom classNames names', async () => {
      let count = 0;
      const nodeRef = React.createRef();
      const { setProps } = render(
        <CSSTransition
          in
          nodeRef={nodeRef}
          timeout={10}
          classNames={{
            exit: 'custom',
            exitActive: 'custom-super-active',
            exitDone: 'custom-super-done',
          }}
        >
          <div ref={nodeRef} />
        </CSSTransition>
      );

      setProps({
        in: false,

        onExit() {
          count++;
          expect(nodeRef.current.className).toEqual('custom');
        },

        onExiting() {
          count++;
          expect(nodeRef.current.className).toEqual(
            'custom custom-super-active'
          );
        },

        onExited() {
          expect(nodeRef.current.className).toEqual('custom-super-done');
        },
      });

      await waitFor(() => {
        expect(count).toEqual(2);
      });
    });

    it('should support empty prefix', async () => {
      let count = 0;

      const nodeRef = React.createRef();
      const { setProps } = render(
        <CSSTransition in nodeRef={nodeRef} timeout={10}>
          <div ref={nodeRef} />
        </CSSTransition>
      );

      setProps({
        in: false,

        onExit() {
          count++;
          expect(nodeRef.current.className).toEqual('exit');
        },

        onExiting() {
          count++;
          expect(nodeRef.current.className).toEqual('exit exit-active');
        },

        onExited() {
          expect(nodeRef.current.className).toEqual('exit-done');
        },
      });

      await waitFor(() => {
        expect(count).toEqual(2);
      });
    });
  });

  describe('reentering', () => {
    it('should remove dynamically applied classes', async () => {
      let count = 0;
      class Test extends React.Component {
        render() {
          const { direction, text, nodeRef, ...props } = this.props;

          return (
            <TransitionGroup
              component={null}
              childFactory={(child) =>
                React.cloneElement(child, {
                  classNames: direction,
                })
              }
            >
              <CSSTransition
                key={text}
                timeout={100}
                nodeRef={nodeRef}
                {...props}
              >
                <span ref={nodeRef}>{text}</span>
              </CSSTransition>
            </TransitionGroup>
          );
        }
      }

      const nodeRef = {
        foo: React.createRef(),
        bar: React.createRef(),
      };

      const { setProps } = render(
        <Test direction="down" text="foo" nodeRef={nodeRef.foo} />
      );

      setProps({
        direction: 'up',
        text: 'bar',
        nodeRef: nodeRef.bar,

        onEnter() {
          count++;
          expect(nodeRef.bar.current.className).toEqual('up-enter');
        },
        onEntering() {
          count++;
          expect(nodeRef.bar.current.className).toEqual(
            'up-enter up-enter-active'
          );
        },
      });

      await waitFor(() => {
        expect(count).toEqual(2);
      });

      setProps({
        direction: 'down',
        text: 'foo',
        nodeRef: nodeRef.foo,

        onEntering() {
          count++;
          expect(nodeRef.foo.current.className).toEqual(
            'down-enter down-enter-active'
          );
        },
        onEntered() {
          count++;
          expect(nodeRef.foo.current.className).toEqual('down-enter-done');
        },
      });

      await waitFor(() => {
        expect(count).toEqual(4);
      });
    });
  });
});
