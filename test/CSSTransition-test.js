import React from 'react';
import { render } from './utils';

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
    it('should apply classes at each transition state', (done) => {
      let count = 0;
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
          done();
        },
      });
    });

    it('should apply custom classNames names', (done) => {
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
          expect(count).toEqual(2);
          done();
        },
      });
    });
  });

  describe('appearing', () => {
    it('should apply appear classes at each transition state', (done) => {
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
            expect(count).toEqual(2);
            done();
          }}
        >
          <div ref={nodeRef} />
        </CSSTransition>
      );
    });

    it('should lose the "*-appear-done" class after leaving and entering again', (done) => {
      const nodeRef = React.createRef();
      const { setProps } = render(
        <CSSTransition
          timeout={10}
          nodeRef={nodeRef}
          classNames="appear-test"
          in={true}
          appear={true}
          onEntered={() => {
            setProps({
              in: false,
              onEntered: () => {},
              onExited: () => {
                expect(nodeRef.current.className).toBe('appear-test-exit-done');
                setProps({
                  in: true,
                  onEntered: () => {
                    expect(nodeRef.current.className).toBe(
                      'appear-test-enter-done'
                    );
                    done();
                  },
                });
              },
            });
          }}
        >
          <div ref={nodeRef} />
        </CSSTransition>
      );
    });

    it('should not add undefined when appearDone is not defined', (done) => {
      const nodeRef = React.createRef();
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
            done();
          }}
        >
          <div ref={nodeRef} />
        </CSSTransition>
      );
    });

    it('should not be appearing in normal enter mode', (done) => {
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
          expect(count).toEqual(2);
          done();
        },
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
    it('should apply classes at each transition state', (done) => {
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
          expect(count).toEqual(2);
          done();
        },
      });
    });

    it('should apply custom classNames names', (done) => {
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
          expect(count).toEqual(2);
          done();
        },
      });
    });

    it('should support empty prefix', (done) => {
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
          expect(count).toEqual(2);
          done();
        },
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

      const rerender = (getProps) =>
        new Promise((resolve) =>
          setProps({
            onEnter: undefined,
            onEntering: undefined,
            onEntered: undefined,
            onExit: undefined,
            onExiting: undefined,
            onExited: undefined,
            ...getProps(resolve),
          })
        );

      await rerender((resolve) => ({
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
          resolve();
        },
      }));

      await rerender((resolve) => ({
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
          resolve();
        },
      }));

      expect(count).toEqual(4);
    });
  });
});
