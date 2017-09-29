import PropTypes from 'prop-types';
import React, { cloneElement, isValidElement } from 'react';

import { getChildMapping, mergeChildMappings } from './utils/ChildMapping';

const values = Object.values || (obj => Object.keys(obj).map(k => obj[k]));

const propTypes = {
  /**
   * `<TransitionGroup>` renders a `<div>` by default. You can change this
   * behavior by providing a `component` prop.
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
   * A convenience prop that enables or disabled appear animations
   * for all children. Note that specifying this will override any defaults set
   * on individual children Transitions.
   */
  appear: PropTypes.bool,
  /**
   * A convenience prop that enables or disabled enter animations
   * for all children. Note that specifying this will override any defaults set
   * on individual children Transitions.
   */
  enter: PropTypes.bool,
 /**
   * A convenience prop that enables or disabled exit animations
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
};

const defaultProps = {
  component: 'div',
  childFactory: child => child,
};

/**
 * The `<TransitionGroup>` component manages a set of `<Transition>` components
 * in a list. Like with the `<Transition>` component, `<TransitionGroup>`, is a
 * state machine for managing the mounting and unmounting of components over
 * time.
 *
 * Consider the example below using the `Fade` CSS transition from before.
 * As items are removed or added to the TodoList the `in` prop is toggled
 * automatically by the `<TransitionGroup>`. You can use _any_ `<Transition>`
 * component in a `<TransitionGroup>`, not just css.
 *
 * ```jsx
 * import TransitionGroup from 'react-transition-group/TransitionGroup';
 * ```
 *
 * <p data-height="465" data-theme-id="dark" data-slug-hash="EwXLzK" data-default-tab="js,result" data-user="jquense" data-embed-version="2" data-pen-title="TransitionGroup Component" class="codepen">See the Pen <a href="https://codepen.io/jquense/pen/EwXLzK/">TransitionGroup Component</a> by Jason Quense (<a href="https://codepen.io/jquense">@jquense</a>) on <a href="https://codepen.io">CodePen</a>.</p>
 *
 *
 * Note that `<TransitionGroup>`  does not define any animation behavior!
 * Exactly _how_ a list item animates is up to the individual `<Transition>`
 * components. This means you can mix and match animations across different
 * list items.
 */
class TransitionGroup extends React.Component {
  static childContextTypes = {
    transitionGroup: PropTypes.object.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    // Initial children should all be entering, dependent on appear
    this.state = {
      children: getChildMapping(props.children, child => {
        const onExited = (node) => {
          this.handleExited(child.key, node, child.props.onExited);
        }

        return cloneElement(child, {
          onExited,
          in: true,
          appear: this.getProp(child, 'appear'),
          enter: this.getProp(child, 'enter'),
          exit: this.getProp(child, 'exit'),
        })
      }),
     };
  }

  getChildContext() {
    return {
       transitionGroup: { isMounting: !this.appeared }
    }
  }
  // use child config unless explictly set by the Group
  getProp(child, prop, props = this.props) {
    return props[prop] != null ?
      props[prop] :
      child.props[prop];
  }

  componentDidMount() {
    this.appeared = true;
  }

  componentWillReceiveProps(nextProps) {
    let prevChildMapping = this.state.children;
    let nextChildMapping = getChildMapping(nextProps.children);

    let children = mergeChildMappings(prevChildMapping, nextChildMapping);

    Object.keys(children).forEach((key) => {
      let child = children[key]

      if (!isValidElement(child)) return;

      const onExited = (node) => {
        this.handleExited(child.key, node, child.props.onExited);
      }

      const hasPrev = key in prevChildMapping;
      const hasNext = key in nextChildMapping;

      const prevChild = prevChildMapping[key];
      const isLeaving = isValidElement(prevChild) && !prevChild.props.in;

      // item is new (entering)
      if (hasNext && (!hasPrev || isLeaving)) {
        // console.log('entering', key)
        children[key] = cloneElement(child, {
          onExited,
          in: true,
          exit: this.getProp(child, 'exit', nextProps),
          enter: this.getProp(child, 'enter', nextProps),
        });
      }
      // item is old (exiting)
      else if (!hasNext && hasPrev && !isLeaving) {
        // console.log('leaving', key)
        children[key] = cloneElement(child, { in: false });
      }
      // item hasn't changed transition states
      // copy over the last transition props;
      else if (hasNext && hasPrev && isValidElement(prevChild)) {
        // console.log('unchanged', key)
        children[key] = cloneElement(child, {
          onExited,
          in: prevChild.props.in,
          exit: this.getProp(child, 'exit', nextProps),
          enter: this.getProp(child, 'enter', nextProps),
        });
      }
    })

    this.setState({ children });
  }

  handleExited = (key, node, originalHandler) => {
    let currentChildMapping = getChildMapping(this.props.children);

    if (key in currentChildMapping) return

    if (originalHandler)
      originalHandler(node)

    this.setState((state) => {
      let children = { ...state.children };

      delete children[key];
      return { children };
    });
  };

  render() {
    const { component: Component, childFactory, ...props } = this.props;
    const { children } = this.state;

    delete props.appear;
    delete props.enter;
    delete props.exit;

    return (
      <Component {...props}>
        {values(children).map(childFactory)}
      </Component>
    );
  }
}

TransitionGroup.propTypes = propTypes;
TransitionGroup.defaultProps = defaultProps;

export default TransitionGroup;
