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
   * remember to spread them throguh if you are wrapping the `<Transition>` as
   * with our `<Fade>` example.
   */
  children: PropTypes.node,

  /**
   * A convenience prop that enables or disabled appear animations
   * for all children. Note that specifiying this will override any defaults set
   * on individual children Transitions.
   */
  appear: PropTypes.bool,
  /**
   * A convenience prop that enables or disabled enter animations
   * for all children. Note that specifiying this will override any defaults set
   * on individual children Transitions.
   */
  enter: PropTypes.bool,
 /**
   * A convenience prop that enables or disabled exit animations
   * for all children. Note that specifiying this will override any defaults set
   * on individual children Transitions.
   */
  exit: PropTypes.bool,
};

const defaultProps = {
  component: 'div',
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
 * ```js
 * class TodoList extends React.Component {
 *   constructor(props) {
 *     super(props)
 *     this.state = {items: ['hello', 'world', 'click', 'me']}
 *   }
 *   handleAdd = () => {
 *     const newItems = this.state.items.concat([
 *       prompt('Enter some text')
 *     ]);
 *     this.setState({ items: newItems });
 *   }
 *   handleRemove(i) {
 *     let newItems = this.state.items.slice();
 *     newItems.splice(i, 1);
 *     this.setState({items: newItems});
 *   }
 *   render() {
 *     return (
 *       <div>
 *         <button onClick={this.handleAdd}>Add Item</button>
 *         <TransitionGroup>
 *           {this.state.items.map((item, i) => (
 *             <Fade key={item}>
 *               <div>
 *                 {item}{' '}
 *                 <button onClick={() => this.handleRemove(i)}>
 *                   remove
 *                 </button>
 *               </div>
 *             </Fade>
 *           ))}
 *         </TransitionGroup>
 *       </div>
 *     );
 *   }
 * }
 * ```
 *
 * Note that `<TransitionGroup>`  does not define any animation behavior!
 * Exactly _how_ a list item animates is up to the individual `<Transition>`
 * components. This means you can mix and match animations across different
 * list items.
 */
class TransitionGroup extends React.Component {
  static displayName = 'TransitionGroup';
  static childContextTypes = {
    transitionGroup: PropTypes.object.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    // Initial children should all be entering, dependent on appear
    this.state = {
      children: getChildMapping(props.children, child => {
        const onExited = () => this.handleExited(child.key);
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

      const onExited = () => this.handleExited(key);

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

  handleExited = (key) => {
    let currentChildMapping = getChildMapping(this.props.children);

    if (key in currentChildMapping) return

    this.setState((state) => {
      let children = { ...state.children };
      delete children[key];
      return { children };
    });
  };

  render() {
    const { component: Component, ...props } = this.props;
    const { children } = this.state;

    delete props.appear;
    delete props.enter;
    delete props.exit;

    return (
      <Component {...props}>
        {values(children)}
      </Component>
    );
  }
}

TransitionGroup.propTypes = propTypes;
TransitionGroup.defaultProps = defaultProps;

export default TransitionGroup;
