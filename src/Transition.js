import * as PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';

import { timeoutsShape } from './utils/PropTypes';

export const UNMOUNTED = 'unmounted';
export const EXITED = 'exited';
export const ENTERING = 'entering';
export const ENTERED = 'entered';
export const EXITING = 'exiting';

/**
 * The Transition component lets you describe a transition from one component
 * state to another _over time_ with a simple declarative API. Most commonly
 * It's used to animate the mounting and unmounting of Component, but can also
 * be used to describe in-place transition states as well.
 *
 * By default the `Transition` component does not alter the behavior of the
 * component it renders, it only tracks "enter" and "exit" states for the components.
 * It's up to you to give meaning and effect to those states. For example we can
 * add styles to a component when it enters or exits:
 *
 * ```jsx
 * import Transition from 'react-transition-group/Transition';
 *
 * const duration = 300;
 *
 * const defaultStyle = {
 *   transition: `opacity ${duration}ms ease-in-out`,
 *   opacity: 0,
 * }
 *
 * const transitionStyles = {
 *   entering: { opacity: 1 },
 *   entered:  { opacity: 1 },
 * };
 *
 * const Fade = ({ in: inProp }) => (
 *   <Transition in={inProp} timeout={duration}>
 *     {(state) => (
 *       <div style={{
 *         ...defaultStyle,
 *         ...transitionStyles[state]
 *       }}>
 *         I'm A fade Transition!
 *       </div>
 *     )}
 *   </Transition>
 * );
 * ```
 *
 */
class Transition extends React.Component {
  static contextTypes = {
    transitionGroup: PropTypes.object,
  };
  static childContextTypes = {
    transitionGroup: ()=>{},
  };

  constructor(props, context) {
    super(props, context);

    let parentGroup = context.transitionGroup;
    // In the context of a TransitionGroup all enters are really appears
    let appear = parentGroup && !parentGroup.isMounting ?
      props.enter :
      props.appear;

    let initialStatus;
    this.nextStatus = null;

    if (props.in) {
      if (appear) {
        initialStatus = EXITED;
        this.nextStatus = ENTERING;
      } else {
        initialStatus = ENTERED;
      }
    } else {
      if (props.unmountOnExit || props.mountOnEnter) {
        initialStatus = UNMOUNTED;
      } else {
        initialStatus = EXITED;
      }
    }

    this.state = { status: initialStatus };

    this.nextCallback = null;
  }

  getChildContext() {
    return { transitionGroup: null }; // allows for nested Transitions
  }

  componentDidMount() {
    this.updateStatus(true);
  }

  componentWillReceiveProps(nextProps) {
    const { status } = this.state;

    if (nextProps.in) {
      if (status === UNMOUNTED) {
        this.setState({ status: EXITED });
      }
      if (status !== ENTERING && status !== ENTERED) {
        this.nextStatus = ENTERING;
      }
    } else {
      if (status === ENTERING || status === ENTERED) {
        this.nextStatus = EXITING;
      }
    }
  }

  componentDidUpdate() {
    this.updateStatus();
  }

  componentWillUnmount() {
    this.cancelNextCallback();
  }

  getTimeouts() {
    const { timeout } = this.props;
    let exit, enter, appear;

    exit = enter = appear = timeout

    if (typeof timeout !== 'number') {
      exit = timeout.exit
      enter = timeout.enter
      appear = timeout.appear
    }
    return { exit, enter, appear }
  }

  updateStatus(mounting = false) {

    if (this.nextStatus !== null) {
      // nextStatus will always be ENTERING or EXITING.
      this.cancelNextCallback();
      const node = ReactDOM.findDOMNode(this);

      if (this.nextStatus === ENTERING) {
        this.performEnter(node, mounting);
      } else {
        this.performExit(node);
      }

      this.nextStatus = null;
    } else if (
      this.props.unmountOnExit &&
      this.state.status === EXITED
    ) {
      this.setState({ status: UNMOUNTED });
    }
  }

  performEnter(node, mounting) {
    const { enter } = this.props;
    const appearing = this.context.transitionGroup ?
      this.context.transitionGroup.isMounting : mounting;

    const timeouts = this.getTimeouts();

    // no enter animation skip right to ENTERED
    // if we are mounting and running this it means appear _must_ be set
    if (!mounting && !enter) {
      this.safeSetState({ status: ENTERED }, () => {
        this.props.onEntered(node);
      });
      return;
    }

    this.props.onEnter(node, appearing);

    this.safeSetState({ status: ENTERING }, () => {
      this.props.onEntering(node, appearing);

      // FIXME: appear timeout?
      this.onTransitionEnd(node, timeouts.enter, () => {
        this.safeSetState({ status: ENTERED }, () => {
          this.props.onEntered(node, appearing);
        });
      });
    });
  }

  performExit(node) {
    const { exit } = this.props;
    const timeouts = this.getTimeouts();

    // no exit animation skip right to EXITED
    if (!exit) {
      this.safeSetState({ status: EXITED }, () => {
        this.props.onExited(node);
      });
      return;
    }
    this.props.onExit(node);

    this.safeSetState({ status: EXITING }, () => {
      this.props.onExiting(node);

      this.onTransitionEnd(node, timeouts.exit, () => {
        this.safeSetState({ status: EXITED }, () => {
          this.props.onExited(node);
        });
      });
    });
  }

  cancelNextCallback() {
    if (this.nextCallback !== null) {
      this.nextCallback.cancel();
      this.nextCallback = null;
    }
  }

  safeSetState(nextState, callback) {
    // This shouldn't be necessary, but there are weird race conditions with
    // setState callbacks and unmounting in testing, so always make sure that
    // we can cancel any pending setState callbacks after we unmount.
    this.setState(nextState, this.setNextCallback(callback));
  }

  setNextCallback(callback) {
    let active = true;

    this.nextCallback = (event) => {
      if (active) {
        active = false;
        this.nextCallback = null;

        callback(event);
      }
    };

    this.nextCallback.cancel = () => {
      active = false;
    };

    return this.nextCallback;
  }

  onTransitionEnd(node, timeout, handler) {
    this.setNextCallback(handler);

    if (node) {
      if (this.props.addEndListener) {
        this.props.addEndListener(node, this.nextCallback)
      }
      setTimeout(this.nextCallback, timeout);
    } else {
      setTimeout(this.nextCallback, 0);
    }
  }

  render() {
    const status = this.state.status;
    if (status === UNMOUNTED) {
      return null;
    }

    const {children, ...childProps} = this.props;
    Object.keys(Transition.propTypes).forEach(key => delete childProps[key]);

    if (typeof children === 'function') {
      return children(status, childProps)
    }

    const child = React.Children.only(children);
    return React.cloneElement(child, childProps);
  }
}

Transition.propTypes = {
  /**
   * Generally a React element to animate, all unknown props on Transition are
   * transfered to the **single** child element.
   *
   * For advanced uses a `function` child can be used instead of a React element.
   * This function is called with the current transition status
   * ('entering', 'entered', 'exiting', 'exited', 'unmounted'), which can used
   * to apply context specific props to a component.
   *
   * ```jsx
   * <Transition timeout={150}>
   *   {(status) => (
   *     <MyComponent className={`fade fade-${status}`} />
   *   )}
   * </Transition>
   * ```
   */
  children: PropTypes.oneOfType([
    PropTypes.func.isRequired,
    PropTypes.element.isRequired,
  ]).isRequired,

  /**
   * Show the component; triggers the enter or exit states
   */
  in: PropTypes.bool,

  /**
   * Wait until the first "enter" transition to mount the component (add it to the DOM)
   */
  mountOnEnter: PropTypes.bool,

  /**
   * Unmount the component (remove it from the DOM) when it is not shown
   */
  unmountOnExit: PropTypes.bool,

  /**
   * Enable or disable appear (entering on mount) transitions.
   */
  appear: PropTypes.bool,

  /**
   * Enable or disable enter transitions.
   */
  enter: PropTypes.bool,

  /**
   * Enable or disable exit transitions.
   */
  exit: PropTypes.bool,

  /**
   * The duration for the transition, in milliseconds.
   *
   * You may specify a single timeout for all transitions like: `timeout={500}`,
   * or individually like:
   *
   * ```jsx
   * timeout={{
   *  enter: 300,
   *  exit: 500,
   * }}
   * ```
   *
   * @type {number | { enter?: number, exit?: number }}
   */
  timeout: timeoutsShape,

  /**
   * Add a custom transition end trigger. Called with the transitioning
   * DOM node and a `done` callback. Allows for more fine grained transition end
   * logic. **Note:** Timeouts are still used as a fallback.
   *
   * ```jsx
   * addEndListener={(node, done) => {
   *   // use the css transitionend event to mark the finish of a transition
   *   node.addEventListener('transitionend', done, false);
   * }}
   * ```
   */
  addEndListener: PropTypes.func,

  /**
   * Callback fired before the "entering" status is applied.
   *
   * @type Function(node: HtmlElement, isAppearing: bool)
   */
  onEnter: PropTypes.func,

  /**
   * Callback fired after the "entering" status is applied.
   *
   * @type Function(node: HtmlElement, isAppearing: bool)
   */
  onEntering: PropTypes.func,

  /**
   * Callback fired after the "enter" status is applied.
   *
   * @type Function(node: HtmlElement, isAppearing: bool)
   */
  onEntered: PropTypes.func,

  /**
   * Callback fired before the "exiting" status is applied.
   *
   * @type Function(node: HtmlElement)
   */
  onExit: PropTypes.func,

  /**
   * Callback fired after the "exiting" status is applied.
   *
   * @type Function(node: HtmlElement)
   */
  onExiting: PropTypes.func,

  /**
   * Callback fired after the "exited" status is applied.
   *
   * @type Function(node: HtmlElement)
   */
  onExited: PropTypes.func,
};

// Name the function so it is clearer in the documentation
function noop() {}

Transition.defaultProps = {
  in: false,
  mountOnEnter: false,
  unmountOnExit: false,
  appear: false,
  enter: true,
  exit: true,

  onEnter: noop,
  onEntering: noop,
  onEntered: noop,

  onExit: noop,
  onExiting: noop,
  onExited: noop
};

Transition.UNMOUNTED = 0;
Transition.EXITED = 1;
Transition.ENTERING = 2;
Transition.ENTERED = 3;
Transition.EXITING = 4;

export default Transition;
