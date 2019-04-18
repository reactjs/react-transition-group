import * as PropTypes from 'prop-types'
import React from 'react'
import ReactDOM from 'react-dom'

import { timeoutsShape } from './utils/PropTypes'
import TransitionGroupContext from './TransitionGroupContext'

export const UNMOUNTED = 'unmounted'
export const EXITED = 'exited'
export const ENTERING = 'entering'
export const ENTERED = 'entered'
export const EXITING = 'exiting'

/**
 * The Transition component lets you describe a transition from one component
 * state to another _over time_ with a simple declarative API. Most commonly
 * it's used to animate the mounting and unmounting of a component, but can also
 * be used to describe in-place transition states as well.
 *
 * ---
 *
 * **Note**: `Transition` is a platform-agnostic base component. If you're using
 * transitions in CSS, you'll probably want to use
 * [`CSSTransition`](https://reactcommunity.org/react-transition-group/css-transition)
 * instead. It inherits all the features of `Transition`, but contains
 * additional features necessary to play nice with CSS transitions (hence the
 * name of the component).
 *
 * ---
 *
 * By default the `Transition` component does not alter the behavior of the
 * component it renders, it only tracks "enter" and "exit" states for the
 * components. It's up to you to give meaning and effect to those states. For
 * example we can add styles to a component when it enters or exits:
 *
 * ```jsx
 * import { Transition } from 'react-transition-group';
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
 *   exiting:  { opacity: 0 },
 *   exited:  { opacity: 0 },
 * };
 *
 * const Fade = ({ in: inProp }) => (
 *   <Transition in={inProp} timeout={duration}>
 *     {state => (
 *       <div style={{
 *         ...defaultStyle,
 *         ...transitionStyles[state]
 *       }}>
 *         I'm a fade Transition!
 *       </div>
 *     )}
 *   </Transition>
 * );
 * ```
 *
 * There are 4 main states a Transition can be in:
 *  - `'entering'`
 *  - `'entered'`
 *  - `'exiting'`
 *  - `'exited'`
 *
 * Transition state is toggled via the `in` prop. When `true` the component
 * begins the "Enter" stage. During this stage, the component will shift from
 * its current transition state, to `'entering'` for the duration of the
 * transition and then to the `'entered'` stage once it's complete. Let's take
 * the following example (we'll use the
 * [useState](https://reactjs.org/docs/hooks-reference.html#usestate) hook):
 *
 * ```jsx
 * function App() {
 *   const [inProp, setInProp] = useState(false);
 *   return (
 *     <div>
 *       <Transition in={inProp} timeout={500}>
 *         {state => (
 *           // ...
 *         )}
 *       </Transition>
 *       <button onClick={() => setInProp(true)}>
 *         Click to Enter
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * When the button is clicked the component will shift to the `'entering'` state
 * and stay there for 500ms (the value of `timeout`) before it finally switches
 * to `'entered'`.
 *
 * When `in` is `false` the same thing happens except the state moves from
 * `'exiting'` to `'exited'`.
 */
class Transition extends React.Component {
  static contextType = TransitionGroupContext

  constructor(props, context) {
    super(props, context)

    let parentGroup = context
    // In the context of a TransitionGroup all enters are really appears
    let appear =
      parentGroup && !parentGroup.isMounting ? props.enter : props.appear

    let initialStatus

    this.appearStatus = null

    if (props.in) {
      if (appear) {
        initialStatus = EXITED
        this.appearStatus = ENTERING
      } else {
        initialStatus = ENTERED
      }
    } else {
      if (props.unmountOnExit || props.mountOnEnter) {
        initialStatus = UNMOUNTED
      } else {
        initialStatus = EXITED
      }
    }

    this.state = { status: initialStatus }

    this.nextCallback = null
  }

  static getDerivedStateFromProps({ in: nextIn }, prevState) {
    if (nextIn && prevState.status === UNMOUNTED) {
      return { status: EXITED }
    }
    return null
  }

  // getSnapshotBeforeUpdate(prevProps) {
  //   let nextStatus = null

  //   if (prevProps !== this.props) {
  //     const { status } = this.state

  //     if (this.props.in) {
  //       if (status !== ENTERING && status !== ENTERED) {
  //         nextStatus = ENTERING
  //       }
  //     } else {
  //       if (status === ENTERING || status === ENTERED) {
  //         nextStatus = EXITING
  //       }
  //     }
  //   }

  //   return { nextStatus }
  // }

  componentDidMount() {
    this.updateStatus(true, this.appearStatus)
  }

  componentDidUpdate(prevProps) {
    let nextStatus = null
    if (prevProps !== this.props) {
      const { status } = this.state

      if (this.props.in) {
        if (status !== ENTERING && status !== ENTERED) {
          nextStatus = ENTERING
        }
      } else {
        if (status === ENTERING || status === ENTERED) {
          nextStatus = EXITING
        }
      }
    }
    this.updateStatus(false, nextStatus)
  }

  componentWillUnmount() {
    this.cancelNextCallback()
  }

  getTimeouts() {
    const { timeout } = this.props
    let exit, enter, appear

    exit = enter = appear = timeout

    if (timeout != null && typeof timeout !== 'number') {
      exit = timeout.exit
      enter = timeout.enter
      // TODO: remove fallback for next major
      appear = timeout.appear !== undefined ? timeout.appear : enter
    }
    return { exit, enter, appear }
  }

  updateStatus(mounting = false, nextStatus) {
    if (nextStatus !== null) {
      // nextStatus will always be ENTERING or EXITING.
      this.cancelNextCallback()
      const node = ReactDOM.findDOMNode(this)

      if (nextStatus === ENTERING) {
        this.performEnter(node, mounting)
      } else {
        this.performExit(node)
      }
    } else if (this.props.unmountOnExit && this.state.status === EXITED) {
      this.setState({ status: UNMOUNTED })
    }
  }

  performEnter(node, mounting) {
    const { enter } = this.props
    const appearing = this.context
      ? this.context.isMounting
      : mounting

    const timeouts = this.getTimeouts()
    const enterTimeout = appearing ? timeouts.appear : timeouts.enter
    // no enter animation skip right to ENTERED
    // if we are mounting and running this it means appear _must_ be set
    if (!mounting && !enter) {
      this.safeSetState({ status: ENTERED }, () => {
        this.props.onEntered(node)
      })
      return
    }

    this.props.onEnter(node, appearing)

    this.safeSetState({ status: ENTERING }, () => {
      this.props.onEntering(node, appearing)

      this.onTransitionEnd(node, enterTimeout, () => {
        this.safeSetState({ status: ENTERED }, () => {
          this.props.onEntered(node, appearing)
        })
      })
    })
  }

  performExit(node) {
    const { exit } = this.props
    const timeouts = this.getTimeouts()

    // no exit animation skip right to EXITED
    if (!exit) {
      this.safeSetState({ status: EXITED }, () => {
        this.props.onExited(node)
      })
      return
    }
    this.props.onExit(node)

    this.safeSetState({ status: EXITING }, () => {
      this.props.onExiting(node)

      this.onTransitionEnd(node, timeouts.exit, () => {
        this.safeSetState({ status: EXITED }, () => {
          this.props.onExited(node)
        })
      })
    })
  }

  cancelNextCallback() {
    if (this.nextCallback !== null) {
      this.nextCallback.cancel()
      this.nextCallback = null
    }
  }

  safeSetState(nextState, callback) {
    // This shouldn't be necessary, but there are weird race conditions with
    // setState callbacks and unmounting in testing, so always make sure that
    // we can cancel any pending setState callbacks after we unmount.
    callback = this.setNextCallback(callback)
    this.setState(nextState, callback)
  }

  setNextCallback(callback) {
    let active = true

    this.nextCallback = event => {
      if (active) {
        active = false
        this.nextCallback = null

        callback(event)
      }
    }

    this.nextCallback.cancel = () => {
      active = false
    }

    return this.nextCallback
  }

  onTransitionEnd(node, timeout, handler) {
    this.setNextCallback(handler)

    const doesNotHaveTimeoutOrListener = timeout == null && !this.props.addEndListener
    if (!node || doesNotHaveTimeoutOrListener) {
      setTimeout(this.nextCallback, 0)
      return
    }

    if (this.props.addEndListener) {
      this.props.addEndListener(node, this.nextCallback)
    }

    if (timeout != null) {
      setTimeout(this.nextCallback, timeout)
    }
  }

  render() {
    const status = this.state.status
    if (status === UNMOUNTED) {
      return null
    }

    const { children, ...childProps } = this.props
    // filter props for Transtition
    delete childProps.in
    delete childProps.mountOnEnter
    delete childProps.unmountOnExit
    delete childProps.appear
    delete childProps.enter
    delete childProps.exit
    delete childProps.timeout
    delete childProps.addEndListener
    delete childProps.onEnter
    delete childProps.onEntering
    delete childProps.onEntered
    delete childProps.onExit
    delete childProps.onExiting
    delete childProps.onExited

    if (typeof children === 'function') {
      // allows for nested Transitions
      return (
        <TransitionGroupContext.Provider value={null}>
          {children(status, childProps)}
        </TransitionGroupContext.Provider>
      )
    }

    const child = React.Children.only(children)
    return (
      // allows for nested Transitions
      <TransitionGroupContext.Provider value={null}>
        {React.cloneElement(child, childProps)}
      </TransitionGroupContext.Provider>
    )
  }
}

Transition.propTypes = {
  /**
   * A `function` child can be used instead of a React element. This function is
   * called with the current transition status (`'entering'`, `'entered'`,
   * `'exiting'`, `'exited'`, `'unmounted'`), which can be used to apply context
   * specific props to a component.
   *
   * ```jsx
   * <Transition in={this.state.in} timeout={150}>
   *   {state => (
   *     <MyComponent className={`fade fade-${state}`} />
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
   * By default the child component is mounted immediately along with
   * the parent `Transition` component. If you want to "lazy mount" the component on the
   * first `in={true}` you can set `mountOnEnter`. After the first enter transition the component will stay
   * mounted, even on "exited", unless you also specify `unmountOnExit`.
   */
  mountOnEnter: PropTypes.bool,

  /**
   * By default the child component stays mounted after it reaches the `'exited'` state.
   * Set `unmountOnExit` if you'd prefer to unmount the component after it finishes exiting.
   */
  unmountOnExit: PropTypes.bool,

  /**
   * Normally a component is not transitioned if it is shown when the `<Transition>` component mounts.
   * If you want to transition on the first mount set `appear` to `true`, and the
   * component will transition in as soon as the `<Transition>` mounts.
   *
   * > Note: there are no specific "appear" states. `appear` only adds an additional `enter` transition.
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
   * The duration of the transition, in milliseconds.
   * Required unless `addEndListener` is provided.
   *
   * You may specify a single timeout for all transitions:
   *
   * ```jsx
   * timeout={500}
   * ```
   *
   * or individually:
   *
   * ```jsx
   * timeout={{
   *  appear: 500,
   *  enter: 300,
   *  exit: 500,
   * }}
   * ```
   *
   * - `appear` defaults to the value of `enter`
   * - `enter` defaults to `0`
   * - `exit` defaults to `0`
   *
   * @type {number | { enter?: number, exit?: number, appear?: number }}
   */
  timeout: (props, ...args) => {
    let pt = timeoutsShape
    if (!props.addEndListener) pt = pt.isRequired
    return pt(props, ...args)
  },

  /**
   * Add a custom transition end trigger. Called with the transitioning
   * DOM node and a `done` callback. Allows for more fine grained transition end
   * logic. **Note:** Timeouts are still used as a fallback if provided.
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
   * Callback fired before the "entering" status is applied. An extra parameter
   * `isAppearing` is supplied to indicate if the enter stage is occurring on the initial mount
   *
   * @type Function(node: HtmlElement, isAppearing: bool) -> void
   */
  onEnter: PropTypes.func,

  /**
   * Callback fired after the "entering" status is applied. An extra parameter
   * `isAppearing` is supplied to indicate if the enter stage is occurring on the initial mount
   *
   * @type Function(node: HtmlElement, isAppearing: bool)
   */
  onEntering: PropTypes.func,

  /**
   * Callback fired after the "entered" status is applied. An extra parameter
   * `isAppearing` is supplied to indicate if the enter stage is occurring on the initial mount
   *
   * @type Function(node: HtmlElement, isAppearing: bool) -> void
   */
  onEntered: PropTypes.func,

  /**
   * Callback fired before the "exiting" status is applied.
   *
   * @type Function(node: HtmlElement) -> void
   */
  onExit: PropTypes.func,

  /**
   * Callback fired after the "exiting" status is applied.
   *
   * @type Function(node: HtmlElement) -> void
   */
  onExiting: PropTypes.func,

  /**
   * Callback fired after the "exited" status is applied.
   *
   * @type Function(node: HtmlElement) -> void
   */
  onExited: PropTypes.func,
}

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
  onExited: noop,
}

Transition.UNMOUNTED = 0
Transition.EXITED = 1
Transition.ENTERING = 2
Transition.ENTERED = 3
Transition.EXITING = 4

export default Transition
