import * as PropTypes from 'prop-types';
import addOneClass from 'dom-helpers/class/addClass';

import removeOneClass from 'dom-helpers/class/removeClass';
import React from 'react';

import Transition from './Transition';
import { classNamesShape } from './utils/PropTypes';

const addClass = (node, classes) => classes && classes.split(' ').forEach(c => addOneClass(node, c));
const removeClass = (node, classes) => classes && classes.split(' ').forEach(c => removeOneClass(node, c));

const propTypes = {
  ...Transition.propTypes,

  /**
   * The animation classNames applied to the component as it enters or exits.
   * A single name can be provided and it will be suffixed for each stage: e.g.
   *
   * `classNames="fade"` applies `fade-enter`, `fade-enter-active`,
   * `fade-exit`, `fade-exit-active`, `fade-appear`, and `fade-appear-active`.
   * Each individual classNames can also be specified independently like:
   *
   * ```js
   * classNames={{
   *  appear: 'my-appear',
   *  appearActive: 'my-active-appear',
   *  enter: 'my-enter',
   *  enterActive: 'my-active-enter',
   *  exit: 'my-exit',
   *  exitActive: 'my-active-exit',
   * }}
   * ```
   *
   * @type {{
   *  appear?: string,
   *  appearActive?: string,
   *  enter?: string,
   *  enterActive?: string,
   *  exit?: string,
   *  exitActive?: string,
   * }}
   */
  classNames: classNamesShape,

  /**
   * A `<Transition>` callback fired immediately after the 'enter' or 'appear' class is
   * applied.
   *
   * @type Function(node: HtmlElement, isAppearing: bool)
   */
  onEnter: PropTypes.func,

  /**
   * A `<Transition>` callback fired immediately after the 'enter-active' or
   * 'appear-active' class is applied.
   *
   * @type Function(node: HtmlElement, isAppearing: bool)
   */
  onEntering: PropTypes.func,

  /**
   * A `<Transition>` callback fired immediately after the 'enter' or
   * 'appear' classes are **removed** from the DOM node.
   *
   * @type Function(node: HtmlElement, isAppearing: bool)
   */
  onEntered: PropTypes.func,


  /**
   * A `<Transition>` callback fired immediately after the 'exit'  class is
   * applied.
   *
   * @type Function(node: HtmlElement)
   */
  onExit: PropTypes.func,

  /**
   * A `<Transition>` callback fired immediately after the 'exit-active' is
   * class is applied.
   *
   * @type Function(node: HtmlElement
   */
  onExiting: PropTypes.func,

  /**
   * A `<Transition>` callback fired immediately after the 'exit' classes
   * are **removed** from the DOM node.
   *
   * @type Function(node: HtmlElement)
   */
  onExited: PropTypes.func,
};

/**
 * A `Transition` component using CSS transitions and animations.
 * It's inspired by the excellent [ng-animate](http://www.nganimate.org/) libary.
 *
 * `CSSTransition` applies a pair of class names during the `appear`, `enter`,
 * and `exit` stages of the transition. The first class is applied and then a
 * second "active" class in order to activate the css animation.
 *
 * When the `in` prop is toggled to `true` the Component will get
 * the `example-enter` CSS class and the `example-enter-active` CSS class
 * added in the next tick. This is a convention based on the `classNames` prop.
 *
 * ```js
 * import CSSTransition from 'react-transition-group/CSSTransition';
 *
 * const Fade = ({ children, ...props }) => (
 *  <CSSTransition
 *    {...props}
 *    timeout={500}
 *    classNames="fade"
 *  >
 *   {children}
 *  </CSSTransition>
 * );
 *
 * class FadeInAndOut extends React.Component {
 *   constructor(...args) {
 *     super(...args);
 *     this.state= { show: false }
 *
 *     setInterval(() => {
 *       this.setState({ show: !this.state.show })
 *     }, 5000)
 *   }
 *   render() {
 *     return (
 *       <Fade in={this.state.show}>
 *         <div>Hello world</div>
 *       </Fade>
 *     )
 *   }
 * }
 * ```
 *
 * And the coorresponding CSS for the `<Fade>` component:
 *
 * ```css
 * .fade-enter {
 *   opacity: 0.01;
 * }
 *
 * .fade-enter.fade-enter-active {
 *   opacity: 1;
 *   transition: opacity 500ms ease-in;
 * }
 *
 * .fade-exit {
 *   opacity: 1;
 * }
 *
 * .fade-exit.fade-exit-active {
 *   opacity: 0.01;
 *   transition: opacity 300ms ease-in;
 * }
 * ```
 */
class CSSTransition extends React.Component {
  onEnter = (node, appearing) => {
    const { className } = this.getClassNames(appearing ? 'appear' : 'enter')

    this.removeClasses(node, 'exit');
    addClass(node, className)

    if (this.props.onEnter) {
      this.props.onEnter(node)
    }
  }

  onEntering = (node, appearing) => {
    const { activeClassName } = this.getClassNames(
      appearing ? 'appear' : 'enter'
    );

    this.reflowAndAddClass(node, activeClassName)

    if (this.props.onEntering) {
      this.props.onEntering(node)
    }
  }

  onEntered = (node, appearing) => {
    this.removeClasses(node, appearing ? 'appear' : 'enter');

    if (this.props.onEntered) {
      this.props.onEntered(node)
    }
  }

  onExit = (node) => {
    const { className } = this.getClassNames('exit')

    this.removeClasses(node, 'appear');
    this.removeClasses(node, 'enter');
    addClass(node, className)

    if (this.props.onExit) {
      this.props.onExit(node)
    }
  }

  onExiting = (node) => {
    const { activeClassName } = this.getClassNames('exit')

    this.reflowAndAddClass(node, activeClassName)

    if (this.props.onExiting) {
      this.props.onExiting(node)
    }
  }

  onExited = (node) => {
    this.removeClasses(node, 'exit');

    if (this.props.onExited) {
      this.props.onExited(node)
    }
  }

  getClassNames = (type) => {
    const { classNames } = this.props

    let className = typeof classNames !== 'string' ?
      classNames[type] : classNames + '-' + type;

    let activeClassName = typeof classNames !== 'string' ?
      classNames[type + 'Active'] : className + '-active';

    return { className, activeClassName }
  }

  removeClasses(node, type) {
    const { className, activeClassName } = this.getClassNames(type)
    className && removeClass(node, className);
    activeClassName && removeClass(node, activeClassName);
  }

  reflowAndAddClass(node, className) {
    // This is for to force a repaint,
    // which is necessary in order to transition styles when adding a class name.
    /* eslint-disable no-unused-expressions */
    node.scrollTop;
    /* eslint-enable no-unused-expressions */
    addClass(node, className);
  }

  render() {
    const props = { ...this.props };

    delete props.classNames;

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

CSSTransition.propTypes = propTypes;

export default CSSTransition
