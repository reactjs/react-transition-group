import PropTypes from 'prop-types';
import React, { cloneElement, isValidElement } from 'react';

import { getChildMapping, mergeChildMappings } from './utils/ChildMapping';

const values = Object.values || (obj => Object.keys(obj).map(k => obj[k]));

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
 * ## Example
 *
 * <iframe src="https://codesandbox.io/embed/00rqyo26kn?fontsize=14" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
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
        return cloneElement(child, {
          onExited: this.handleExited.bind(this, child),
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

      const hasPrev = key in prevChildMapping;
      const hasNext = key in nextChildMapping;

      const prevChild = prevChildMapping[key];
      const isLeaving = isValidElement(prevChild) && !prevChild.props.in;

      // item is new (entering)
      if (hasNext && (!hasPrev || isLeaving)) {
        // console.log('entering', key)
        children[key] = cloneElement(child, {
          onExited: this.handleExited.bind(this, child),
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
          onExited: this.handleExited.bind(this, child),
          in: prevChild.props.in,
          exit: this.getProp(child, 'exit', nextProps),
          enter: this.getProp(child, 'enter', nextProps),
        });
      }
    })

    this.setState({ children });
  }

  handleExited(child, node){
    let currentChildMapping = getChildMapping(this.props.children);

    if (child.key in currentChildMapping) return;

    if (child.props.onExited) {
      child.props.onExited(node);
    }

    this.setState((state) => {
      let children = { ...state.children };

      delete children[child.key];
      return { children };
    });
  }

  render() {
    const { component: Component, childFactory, ...props } = this.props;
    const children = values(this.state.children).map(childFactory);

    delete props.appear;
    delete props.enter;
    delete props.exit;

    if (Component === null) {
      return children;
    }
    return (
      <Component {...props}>
        {children}
      </Component>
    );
  }
}

TransitionGroup.propTypes = propTypes;
TransitionGroup.defaultProps = defaultProps;

export default TransitionGroup;
