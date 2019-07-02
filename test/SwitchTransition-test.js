import React from 'react';

import { mount } from 'enzyme';

import Transition, { ENTERED } from '../src/Transition';
import SwitchTransition, { modes } from '../src/SwitchTransition';

describe('SwitchTransition', () => {
  let log, Parent;
  beforeEach(() => {
    log = [];
    let events = {
      onEnter: (_, m) => log.push(m ? 'appear' : 'enter'),
      onEntering: (_, m) => log.push(m ? 'appearing' : 'entering'),
      onEntered: (_, m) => log.push(m ? 'appeared' : 'entered'),
      onExit: () => log.push('exit'),
      onExiting: () => log.push('exiting'),
      onExited: () => log.push('exited')
    };

    Parent = function Parent({ on, rendered = true }) {
      return (
        <SwitchTransition>
          {rendered ? (
            <Transition timeout={0} key={on ? 'first' : 'second'} {...events}>
              <span />
            </Transition>
          ) : null}
        </SwitchTransition>
      );
    };
  });

  it('should have default status ENTERED', () => {
    const wrapper = mount(
      <SwitchTransition>
        <Transition timeout={0} key="first">
          <span />
        </Transition>
      </SwitchTransition>
    );

    expect(wrapper.state('status')).toBe(ENTERED);
  });

  it('should have default mode: out-in', () => {
    const wrapper = mount(
      <SwitchTransition>
        <Transition timeout={0} key="first">
          <span />
        </Transition>
      </SwitchTransition>
    );

    expect(wrapper.prop('mode')).toBe(modes.out);
  });

  it('should work without childs', () => {
    expect(() => {
      mount(
        <SwitchTransition>
          <Transition timeout={0} key="first">
            <span />
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
