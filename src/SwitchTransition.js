import React from 'react';
import PropTypes from 'prop-types';
import { ENTERED, ENTERING, EXITING } from './Transition'
import TransitionGroupContext from './TransitionGroupContext';

function areChildrenDifferent(oldChildren, newChildren) {
  if (oldChildren === newChildren) return false;
  if (
    React.isValidElement(oldChildren) &&
    React.isValidElement(newChildren) &&
    oldChildren.key != null &&
    oldChildren.key === newChildren.key
  ) {
    return false;
  }
  return true;
}

/**
 * Enum of modes for SwitchTransition component
 * @enum { string }
 */
export const modes = {
  out: 'out-in',
  in: 'in-out'
};

const callHook = (element, name, cb) => (...args) => {
  element.props[name] && element.props[name](...args)
  cb()
}

const leaveRenders = {
  [modes.out]: ({ current, changeState }) =>
    React.cloneElement(current, {
      in: false,
      onExited: callHook(current, 'onExited', () => {
        changeState(ENTERING, null);
      })
    }),
  [modes.in]: ({ current, changeState, children }) => [
    current,
    React.cloneElement(children, {
      in: true,
      onEntered: callHook(children, 'onEntered', () => {
        changeState(ENTERING);
      })
    })
  ]
};

const enterRenders = {
  [modes.out]: ({ children, changeState }) =>
    React.cloneElement(children, {
      in: true,
      onEntered: callHook(children, 'onEntered', () => {
        changeState(ENTERED, React.cloneElement(children, { in: true }));
      })
    }),
  [modes.in]: ({ current, children, changeState }) => [
    React.cloneElement(current, {
      in: false,
      onExited: callHook(current, 'onExited', () => {
        changeState(ENTERED, React.cloneElement(children, { in: true }));
      })
    }),
    React.cloneElement(children, {
      in: true
    })
  ]
};

/**
 * A transition component inspired by the [vue transition modes](https://vuejs.org/v2/guide/transitions.html#Transition-Modes).
 * You can use it when you want to control the render between state transitions.
 * Based on the selected mode and the child's key which is the `Transition` or `CSSTransition` component, the `SwitchTransition` makes a consistent transition between them.
 *
 * If the `out-in` mode is selected, the `SwitchTransition` waits until the old child leaves and then inserts a new child.
 * If the `in-out` mode is selected, the `SwitchTransition` inserts a new child first, waits for the new child to enter and then removes the old child.
 *
 * **Note**: If you want the animation to happen simultaneously
 * (that is, to have the old child removed and a new child inserted **at the same time**),
 * you should use
 * [`TransitionGroup`](https://reactcommunity.org/react-transition-group/transition-group)
 * instead.
 *
 * ```jsx
 * function App() {
 *  const [state, setState] = useState(false);
 *  return (
 *    <SwitchTransition>
 *      <CSSTransition
 *        key={state ? "Goodbye, world!" : "Hello, world!"}
 *        addEndListener={(node, done) => node.addEventListener("transitionend", done, false)}
 *        classNames='fade'
 *      >
 *        <button onClick={() => setState(state => !state)}>
 *          {state ? "Goodbye, world!" : "Hello, world!"}
 *        </button>
 *      </CSSTransition>
 *    </SwitchTransition>
 *  );
 * }
 * ```
 *
 * ```css
 * .fade-enter{
 *    opacity: 0;
 * }
 * .fade-exit{
 *    opacity: 1;
 * }
 * .fade-enter-active{
 *    opacity: 1;
 * }
 * .fade-exit-active{
 *    opacity: 0;
 * }
 * .fade-enter-active,
 * .fade-exit-active{
 *    transition: opacity 500ms;
 * }
 * ```
 */
class SwitchTransition extends React.Component {
  state = {
    status: ENTERED,
    current: null
  };

  appeared = false;

  componentDidMount() {
    this.appeared = true;
  }

  static getDerivedStateFromProps(props, state) {
    if (props.children == null) {
      return {
        current: null
      }
    }

    if (state.status === ENTERING && props.mode === modes.in) {
      return {
        status: ENTERING
      };
    }

    if (state.current && areChildrenDifferent(state.current, props.children)) {
      return {
        status: EXITING
      };
    }

    return {
      current: React.cloneElement(props.children, {
        in: true
      })
    };
  }

  changeState = (status, current = this.state.current) => {
    this.setState({
      status,
      current
    });
  };

  render() {
    const {
      props: { children, mode },
      state: { status, current }
    } = this;

    const data = { children, current, changeState: this.changeState, status };
    let component
    switch (status) {
      case ENTERING:
        component = enterRenders[mode](data);
        break;
      case EXITING:
        component = leaveRenders[mode](data)
        break;
      case ENTERED:
        component = current;
    }

    return (
      <TransitionGroupContext.Provider value={{ isMounting: !this.appeared }}>
        {component}
      </TransitionGroupContext.Provider>
    )
  }
}


SwitchTransition.propTypes = {
  /**
   * Transition modes.
   * `out-in`: Current element transitions out first, then when complete, the new element transitions in.
   * `in-out`: New element transitions in first, then when complete, the current element transitions out.
   *
   * @type {'out-in'|'in-out'}
   */
  mode: PropTypes.oneOf([modes.in, modes.out]),
  /**
   * Any `Transition` or `CSSTransition` component.
   */
  children: PropTypes.oneOfType([
    PropTypes.element.isRequired,
  ]),
}

SwitchTransition.defaultProps = {
  mode: modes.out
}

export default SwitchTransition;
