import React from 'react';

import { mount } from 'enzyme';

import Transition, { ENTERED } from '../src/Transition';
import SwitchTransition, { modes } from '../src/SwitchTransition';

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
      onExited: () => log.push('exited')
    };

    const nodeRef = React.createRef()
    Parent = function Parent({ on, rendered = true }) {
      return (
        <SwitchTransition>
          {rendered ? (
            <Transition nodeRef={nodeRef} timeout={0} key={on ? 'first' : 'second'} {...events}>
              <span ref={nodeRef} />
            </Transition>
          ) : null}
        </SwitchTransition>
      );
    };
  });

  it('should have default status ENTERED', () => {
    const nodeRef = React.createRef()
    const wrapper = mount(
      <SwitchTransition>
        <Transition nodeRef={nodeRef} timeout={0} key="first">
          <span ref={nodeRef} />
        </Transition>
      </SwitchTransition>
    );

    expect(wrapper.state('status')).toBe(ENTERED);
  });

  it('should have default mode: out-in', () => {
    const nodeRef = React.createRef()
    const wrapper = mount(
      <SwitchTransition>
        <Transition nodeRef={nodeRef} timeout={0} key="first">
          <span ref={nodeRef} />
        </Transition>
      </SwitchTransition>
    );

    expect(wrapper.prop('mode')).toBe(modes.out);
  });

  it('should work without childs', () => {
    const nodeRef = React.createRef()
    expect(() => {
      mount(
        <SwitchTransition>
          <Transition nodeRef={nodeRef} timeout={0} key="first">
            <span ref={nodeRef} />
          </Transition>
        </SwitchTransition>
      );
    }).not.toThrow();
  });

  it('should switch between components on change state', () => {
    const wrapper = mount(<Parent on={true} />);

    jest.useFakeTimers();
    expect(wrapper.find(SwitchTransition).getElement().props.children.key).toBe(
      'first'
    );
    wrapper.setProps({ on: false });
    expect(log).toEqual(['exit', 'exiting']);
    jest.runAllTimers();
    expect(log).toEqual([
      'exit',
      'exiting',
      'exited',
      'enter',
      'entering',
      'entered'
    ]);
    expect(wrapper.find(SwitchTransition).getElement().props.children.key).toBe(
      'second'
    );
  });

  it('should switch between null and component', () => {
    const wrapper = mount(<Parent on={true} rendered={false} />);

    expect(
      wrapper.find(SwitchTransition).getElement().props.children
    ).toBeFalsy();

    jest.useFakeTimers();

    wrapper.setProps({ rendered: true });
    jest.runAllTimers();
    expect(log).toEqual(['enter', 'entering', 'entered']);
    expect(
      wrapper.find(SwitchTransition).getElement().props.children
    ).toBeTruthy();
    expect(wrapper.find(SwitchTransition).getElement().props.children.key).toBe(
      'first'
    );

    wrapper.setProps({ on: false, rendered: true });
    jest.runAllTimers();
    expect(log).toEqual([
      'enter',
      'entering',
      'entered',
      'exit',
      'exiting',
      'exited',
      'enter',
      'entering',
      'entered'
    ]);
    expect(wrapper.find(SwitchTransition).getElement().props.children.key).toBe(
      'second'
    );
  });
});
