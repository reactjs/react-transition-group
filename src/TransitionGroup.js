import PropTypes from 'prop-types'
import React from 'react'
import { polyfill } from 'react-lifecycles-compat'


import {
  getChildMapping,
  getInitialChildMapping,
  getNextChildMapping,
} from './utils/ChildMapping'

const values = Object.values || (obj => Object.keys(obj).map(k => obj[k]))

const propTypes = {
  /**
   * `<TransitionGroup>` renders a `<div>` by default. You can change this
   * behavior by providing a `component` prop.
   * If you use React v16+ and would like to avoid a wrapping `<div>` element
   * you can pass in `component={null}`. This is useful if the wrapping div
   * borks your css styles.
   */
  component: PropTypes.any,
  /**
   * A set of `<Transition>` components, that are toggled `in` and out as they
   * leave. the `<TransitionGroup>` will inject specific transition props, so
   * remember to spread them through if you are wrapping the `<Transition>` as
   * with our `<Fade>` example.
   */
  children: PropTypes.node,

  /**
   * A convenience prop that enables or disables appear animations
   * for all children. Note that specifying this will override any defaults set
   * on individual children Transitions.
   */
  appear: PropTypes.bool,
  /**
   * A convenience prop that enables or disables enter animations
   * for all children. Note that specifying this will override any defaults set
   * on individual children Transitions.
   */
  enter: PropTypes.bool,
  /**
   * A convenience prop that enables or disables exit animations
   * for all children. Note that specifying this will override any defaults set
   * on individual children Transitions.
   */
  exit: PropTypes.bool,

  /**
   * You may need to apply reactive updates to a child as it is exiting.
   * This is generally done by using `cloneElement` however in the case of an exiting
   * child the element has already been removed and not accessible to the consumer.
   *
   * If you do need to update a child as it leaves you can provide a `childFactory`
   * to wrap every child, even the ones that are leaving.
   *
   * @type Function(child: ReactElement) -> ReactElement
   */
  childFactory: PropTypes.func,
}

const defaultProps = {
  component: 'div',
  childFactory: child => child,
}

/**
 * The `<TransitionGroup>` component manages a set of transition components
 * (`<Transition>` and `<CSSTransition>`) in a list. Like with the transition
 * components, `<TransitionGroup>` is a state machine for managing the mounting
 * and unmounting of components over time.
 *
 * Consider the example below. As items are removed or added to the TodoList the
 * `in` prop is toggled automatically by the `<TransitionGroup>`.
 *
 * Note that `<TransitionGroup>`  does not define any animation behavior!
 * Exactly _how_ a list item animates is up to the individual transition
 * component. This means you can mix and match animations across different list
 * items.
 */
class TransitionGroup extends React.Component {
  static childContextTypes = {
    transitionGroup: PropTypes.object.isRequired,
  }

  constructor(props, context) {
    super(props, context)

    const handleExited = this.handleExited.bind(this)

    // Initial children should all be entering, dependent on appear
    this.state = {
      handleExited,
      firstRender: true,
    }
  }

  getChildContext() {
    return {
      transitionGroup: { isMounting: !this.appeared },
    }
  }

  componentDidMount() {
    this.appeared = true
  }

  static getDerivedStateFromProps(
    nextProps,
    { children: prevChildMapping, handleExited, firstRender }
  ) {
    return {
      children: firstRender
        ? getInitialChildMapping(nextProps, handleExited)
        : getNextChildMapping(nextProps, prevChildMapping, handleExited),
      firstRender: false,
    }
  }

  handleExited(child, node) {
    let currentChildMapping = getChildMapping(this.props.children)

    if (child.key in currentChildMapping) return

    if (child.props.onExited) {
      child.props.onExited(node)
    }

    this.setState(state => {
      let children = { ...state.children }

      delete children[child.key]
      return { children }
    })
  }

  render() {
    const { component: Component, childFactory, ...props } = this.props
    const children = values(this.state.children).map(childFactory)

    delete props.appear
    delete props.enter
    delete props.exit

    if (Component === null) {
      return children
    }
    return <Component {...props}>{children}</Component>
  }
}

TransitionGroup.propTypes = propTypes
TransitionGroup.defaultProps = defaultProps

export default polyfill(TransitionGroup)
