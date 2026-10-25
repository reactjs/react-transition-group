import React from 'react';

import { act, render } from './utils';

import Transition, { ENTERED } from '../src/Transition';
import SwitchTransition from '../src/SwitchTransition';

describe('SwitchTransition', () => {
  let log, Parent;
  beforeEach(() => {
    log = [];
    let events = {
      onEnter: (m) => log.push(m ? 'appear' : 'enter'),
      onEntering: (m) => log.push(m ? 'appearing' : 'entering'),
      onEntered: (m) => log.push(m ? 'appeared' : 'entered'),
      onExit: () => log.push('exit'),
      onExiting: () => log.push('exiting'),
      onExited: () => log.push('exited'),
    };

    const nodeRef = React.createRef();
    Parent = function Parent({ on, rendered = true }) {
      return (
        <SwitchTransition>
          {rendered ? (
            <Transition
              nodeRef={nodeRef}
              timeout={0}
              key={on ? 'first' : 'second'}
              {...events}
            >
              <span ref={nodeRef}>{on ? 'first' : 'second'}</span>
            </Transition>
          ) : null}
        </SwitchTransition>
      );
    };

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should have default status ENTERED', () => {
    const nodeRef = React.createRef();
    render(
      <SwitchTransition>
        <Transition nodeRef={nodeRef} timeout={0} key="first">
          {(status) => {
            return <span ref={nodeRef}>status: {status}</span>;
          }}
        </Transition>
      </SwitchTransition>
    );

    expect(nodeRef.current.textContent).toBe(`status: ${ENTERED}`);
  });

  it('should have default mode: out-in', () => {
    const firstNodeRef = React.createRef();
    const secondNodeRef = React.createRef();
    const { rerender } = render(
      <SwitchTransition>
        <Transition nodeRef={firstNodeRef} timeout={0} key="first">
          {(status) => {
            return <span ref={firstNodeRef}>first status: {status}</span>;
          }}
        </Transition>
      </SwitchTransition>
    );
    rerender(
      <SwitchTransition>
        <Transition nodeRef={secondNodeRef} timeout={0} key="second">
          {(status) => {
            return <span ref={secondNodeRef}>second status: {status}</span>;
          }}
        </Transition>
      </SwitchTransition>
    );

    expect(firstNodeRef.current.textContent).toBe('first status: exiting');
    expect(secondNodeRef.current).toBe(null);
  });

  it('should work without childs', () => {
    const nodeRef = React.createRef();
    expect(() => {
      render(
        <SwitchTransition>
          <Transition nodeRef={nodeRef} timeout={0} key="first">
            <span ref={nodeRef} />
          </Transition>
        </SwitchTransition>
      );
    }).not.toThrow();
  });

  it('should switch between components on change state', () => {
    const { container, setProps } = render(<Parent on={true} />);

    expect(container.textContent).toBe('first');
    setProps({ on: false });
    expect(log).toEqual(['exit', 'exiting']);
    act(() => {
      jest.runAllTimers();
    });
    act(() => {
      jest.runAllTimers();
    });
    expect(log).toEqual([
      'exit',
      'exiting',
      'exited',
      'enter',
      'entering',
      'entered',
    ]);
    expect(container.textContent).toBe('second');
  });

  it('should switch between null and component', () => {
    const { container, setProps } = render(
      <Parent on={true} rendered={false} />
    );

    expect(container.textContent).toBe('');

    jest.useFakeTimers();

    setProps({ rendered: true });
    act(() => {
      jest.runAllTimers();
    });
    expect(log).toEqual(['enter', 'entering', 'entered']);
    expect(container.textContent).toBe('first');

    setProps({ on: false, rendered: true });
    act(() => {
      jest.runAllTimers();
    });
    act(() => {
      jest.runAllTimers();
    });
    expect(log).toEqual([
      'enter',
      'entering',
      'entered',
      'exit',
      'exiting',
      'exited',
      'enter',
      'entering',
      'entered',
    ]);

    expect(container.textContent).toBe('second');
  });

  it.each([
    ['out-in', 'exiting'],
    ['out-in', 'entering'],
    ['in-out', 'entering'],
    ['in-out', 'exiting'],
  ])('handles null children in %s mode while %s', (mode, status) => {
    const firstRef = React.createRef();
    const secondRef = React.createRef();
    const first = (
      <Transition nodeRef={firstRef} timeout={10} key="first">
        {(state) => <span ref={firstRef}>first: {state}</span>}
      </Transition>
    );
    const second = (
      <Transition nodeRef={secondRef} timeout={10} key="second">
        {(state) => <span ref={secondRef}>second: {state}</span>}
      </Transition>
    );
    const { container, rerender } = render(
      <SwitchTransition mode={mode}>{first}</SwitchTransition>
    );

    rerender(<SwitchTransition mode={mode}>{second}</SwitchTransition>);
    if (status === (mode === 'out-in' ? 'entering' : 'exiting')) {
      act(() => {
        jest.runOnlyPendingTimers();
      });
    }
    expect(container.textContent).toContain(status);

    rerender(<SwitchTransition mode={mode}>{null}</SwitchTransition>);
    act(() => {
      jest.runAllTimers();
    });
    expect(container.textContent).toBe('');

    rerender(<SwitchTransition mode={mode}>{first}</SwitchTransition>);
    act(() => {
      jest.runAllTimers();
    });
    expect(container.textContent).toBe('first: entered');
  });
});
