import PropTypes from 'prop-types';
import addOneClass from 'dom-helpers/addClass';

import removeOneClass from 'dom-helpers/removeClass';
import React from 'react';

import Transition from './Transition';
import { classNamesShape } from './utils/PropTypes';
import { forceReflow } from './utils/reflow';

const addClass = (node, classes) =>
  node && classes && classes.split(' ').forEach((c) => addOneClass(node, c));
const removeClass = (node, classes) =>
  node && classes && classes.split(' ').forEach((c) => removeOneClass(node, c));

/**
 * A transition component inspired by the excellent
 * [ng-animate](https://docs.angularjs.org/api/ngAnimate) library, you should
 * use it if you're using CSS transitions or animations. It's built upon the
 * [`Transition`](https://reactcommunity.org/react-transition-group/transition)
 * component, so it inherits all of its props.
 *
 * `CSSTransition` applies a pair of class names during the `appear`, `enter`,
 * and `exit` states of the transition. The first class is applied and then a
 * second `*-active` class in order to activate the CSS transition. After the
 * transition, matching `*-done` class names are applied to persist the
 * transition state.
 *
 * ```jsx
 * function App() {
 *   const [inProp, setInProp] = useState(false);
 *   return (
 *     <div>
 *       <CSSTransition in={inProp} timeout={200} classNames="my-node">
 *         <div>
 *           {"I'll receive my-node-* classes"}
 *         </div>
 *       </CSSTransition>
 *       <button type="button" onClick={() => setInProp(true)}>
 *         Click to Enter
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * When the `in` prop is set to `true`, the child component will first receive
 * the class `example-enter`, then the `example-enter-active` will be added in
 * the next tick. `CSSTransition` [forces a
 * reflow](https://github.com/reactjs/react-transition-group/blob/5007303e729a74be66a21c3e2205e4916821524b/src/CSSTransition.js#L208-L215)
 * between before adding the `example-enter-active`. This is an important trick
 * because it allows us to transition between `example-enter` and
 * `example-enter-active` even though they were added immediately one after
 * another. Most notably, this is what makes it possible for us to animate
 * _appearance_.
 *
 * ```css
 * .my-node-enter {
 *   opacity: 0;
 * }
 * .my-node-enter-active {
 *   opacity: 1;
 *   transition: opacity 200ms;
 * }
 * .my-node-exit {
 *   opacity: 1;
 * }
 * .my-node-exit-active {
 *   opacity: 0;
 *   transition: opacity 200ms;
 * }
 * ```
 *
 * `*-active` classes represent which styles you want to animate **to**, so it's
 * important to add `transition` declaration only to them, otherwise transitions
 * might not behave as intended! This might not be obvious when the transitions
 * are symmetrical, i.e. when `*-enter-active` is the same as `*-exit`, like in
 * the example above (minus `transition`), but it becomes apparent in more
 * complex transitions.
 *
 * **Note**: If you're using the
 * [`appear`](http://reactcommunity.org/react-transition-group/transition#Transition-prop-appear)
 * prop, make sure to define styles for `.appear-*` classes as well.
 */
class CSSTransition extends React.Component {
  static defaultProps = {
    classNames: '',
  };

  appliedClasses = {
    appear: {},
    enter: {},
    exit: {},
  };

  onEnter = (maybeNode, maybeAppearing) => {
    const [node, appearing] = this.resolveArguments(maybeNode, maybeAppearing);
    this.removeClasses(node, 'exit');
    this.addClass(node, appearing ? 'appear' : 'enter', 'base');

    if (this.props.onEnter) {
      this.props.onEnter(maybeNode, maybeAppearing);
    }
  };

  onEntering = (maybeNode, maybeAppearing) => {
    const [node, appearing] = this.resolveArguments(maybeNode, maybeAppearing);
    const type = appearing ? 'appear' : 'enter';
    this.addClass(node, type, 'active');

    if (this.props.onEntering) {
      this.props.onEntering(maybeNode, maybeAppearing);
    }
  };

  onEntered = (maybeNode, maybeAppearing) => {
    const [node, appearing] = this.resolveArguments(maybeNode, maybeAppearing);
    const type = appearing ? 'appear' : 'enter';
    this.removeClasses(node, type);
    this.addClass(node, type, 'done');

    if (this.props.onEntered) {
      this.props.onEntered(maybeNode, maybeAppearing);
    }
  };

  onExit = (maybeNode) => {
    const [node] = this.resolveArguments(maybeNode);
    this.removeClasses(node, 'appear');
    this.removeClasses(node, 'enter');
    this.addClass(node, 'exit', 'base');

    if (this.props.onExit) {
      this.props.onExit(maybeNode);
    }
  };

  onExiting = (maybeNode) => {
    const [node] = this.resolveArguments(maybeNode);
    this.addClass(node, 'exit', 'active');

    if (this.props.onExiting) {
      this.props.onExiting(maybeNode);
    }
  };

  onExited = (maybeNode) => {
    const [node] = this.resolveArguments(maybeNode);
    this.removeClasses(node, 'exit');
    this.addClass(node, 'exit', 'done');

    if (this.props.onExited) {
      this.props.onExited(maybeNode);
    }
  };

  // when prop `nodeRef` is provided `node` is excluded
  resolveArguments = (maybeNode, maybeAppearing) =>
    this.props.nodeRef
      ? [this.props.nodeRef.current, maybeNode] // here `maybeNode` is actually `appearing`
      : [maybeNode, maybeAppearing]; // `findDOMNode` was used

  getClassNames = (type) => {
    const { classNames } = this.props;
    const isStringClassNames = typeof classNames === 'string';
    const prefix = isStringClassNames && classNames ? `${classNames}-` : '';

    let baseClassName = isStringClassNames
      ? `${prefix}${type}`
      : classNames[type];

    let activeClassName = isStringClassNames
      ? `${baseClassName}-active`
      : classNames[`${type}Active`];

    let doneClassName = isStringClassNames
      ? `${baseClassName}-done`
      : classNames[`${type}Done`];

    return {
      baseClassName,
      activeClassName,
      doneClassName,
    };
  };

  addClass(node, type, phase) {
    let className = this.getClassNames(type)[`${phase}ClassName`];
    const { doneClassName } = this.getClassNames('enter');

    if (type === 'appear' && phase === 'done' && doneClassName) {
      className += ` ${doneClassName}`;
    }

    // This is to force a repaint,
    // which is necessary in order to transition styles when adding a class name.
    if (phase === 'active') {
      if (node) forceReflow(node);
    }

    if (className) {
      this.appliedClasses[type][phase] = className;
      addClass(node, className);
    }
  }

  removeClasses(node, type) {
    const {
      base: baseClassName,
      active: activeClassName,
      done: doneClassName,
    } = this.appliedClasses[type];

    this.appliedClasses[type] = {};

    if (baseClassName) {
      removeClass(node, baseClassName);
    }
    if (activeClassName) {
      removeClass(node, activeClassName);
    }
    if (doneClassName) {
      removeClass(node, doneClassName);
    }
  }

  render() {
    const { classNames: _, ...props } = this.props;

    return (
      <Transition
        {...props}
        onEnter={this.onEnter}
        onEntered={this.onEntered}
        onEntering={this.onEntering}
        onExit={this.onExit}
        onExiting={this.onExiting}
        onExited={this.onExited}
      />
    );
  }
}

CSSTransition.propTypes = {
  ...Transition.propTypes,

  /**
   * The animation classNames applied to the component as it appears, enters,
   * exits or has finished the transition. A single name can be provided, which
   * will be suffixed for each stage, e.g. `classNames="fade"` applies:
   *
   * - `fade-appear`, `fade-appear-active`, `fade-appear-done`
   * - `fade-enter`, `fade-enter-active`, `fade-enter-done`
   * - `fade-exit`, `fade-exit-active`, `fade-exit-done`
   *
   * A few details to note about how these classes are applied:
   *
   * 1. They are _joined_ with the ones that are already defined on the child
   *    component, so if you want to add some base styles, you can use
   *    `className` without worrying that it will be overridden.
   *
   * 2. If the transition component mounts with `in={false}`, no classes are
   *    applied yet. You might be expecting `*-exit-done`, but if you think
   *    about it, a component cannot finish exiting if it hasn't entered yet.
   *
   * 2. `fade-appear-done` and `fade-enter-done` will _both_ be applied. This
   *    allows you to define different behavior for when appearing is done and
   *    when regular entering is done, using selectors like
   *    `.fade-enter-done:not(.fade-appear-done)`. For example, you could apply
   *    an epic entrance animation when element first appears in the DOM using
   *    [Animate.css](https://daneden.github.io/animate.css/). Otherwise you can
   *    simply use `fade-enter-done` for defining both cases.
   *
   * Each individual classNames can also be specified independently like:
   *
   * ```js
   * classNames={{
   *  appear: 'my-appear',
   *  appearActive: 'my-active-appear',
   *  appearDone: 'my-done-appear',
   *  enter: 'my-enter',
   *  enterActive: 'my-active-enter',
   *  enterDone: 'my-done-enter',
   *  exit: 'my-exit',
   *  exitActive: 'my-active-exit',
   *  exitDone: 'my-done-exit',
   * }}
   * ```
   *
   * If you want to set these classes using CSS Modules:
   *
   * ```js
   * import styles from './styles.css';
   * ```
   *
   * you might want to use camelCase in your CSS file, that way could simply
   * spread them instead of listing them one by one:
   *
   * ```js
   * classNames={{ ...styles }}
   * ```
   *
   * @type {string | {
   *  appear?: string,
   *  appearActive?: string,
   *  appearDone?: string,
   *  enter?: string,
   *  enterActive?: string,
   *  enterDone?: string,
   *  exit?: string,
   *  exitActive?: string,
   *  exitDone?: string,
   * }}
   */
  classNames: classNamesShape,

  /**
   * A `<Transition>` callback fired immediately after the 'enter' or 'appear' class is
   * applied.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed.
   *
   * @type Function(node: HtmlElement, isAppearing: bool)
   */
  onEnter: PropTypes.func,

  /**
   * A `<Transition>` callback fired immediately after the 'enter-active' or
   * 'appear-active' class is applied.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed.
   *
   * @type Function(node: HtmlElement, isAppearing: bool)
   */
  onEntering: PropTypes.func,

  /**
   * A `<Transition>` callback fired immediately after the 'enter' or
   * 'appear' classes are **removed** and the `done` class is added to the DOM node.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed.
   *
   * @type Function(node: HtmlElement, isAppearing: bool)
   */
  onEntered: PropTypes.func,

  /**
   * A `<Transition>` callback fired immediately after the 'exit' class is
   * applied.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed
   *
   * @type Function(node: HtmlElement)
   */
  onExit: PropTypes.func,

  /**
   * A `<Transition>` callback fired immediately after the 'exit-active' is applied.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed
   *
   * @type Function(node: HtmlElement)
   */
  onExiting: PropTypes.func,

  /**
   * A `<Transition>` callback fired immediately after the 'exit' classes
   * are **removed** and the `exit-done` class is added to the DOM node.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed
   *
   * @type Function(node: HtmlElement)
   */
  onExited: PropTypes.func,
};

export default CSSTransition;
