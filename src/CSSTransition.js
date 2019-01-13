import * as PropTypes from 'prop-types';
import addOneClass from 'dom-helpers/class/addClass';

import removeOneClass from 'dom-helpers/class/removeClass';
import React from 'react';

import Transition from './Transition';
import { classNamesShape } from './utils/PropTypes';

const addClass = (node, classes) => node && classes && classes.split(' ').forEach(c => addOneClass(node, c));
const removeClass = (node, classes) => node && classes && classes.split(' ').forEach(c => removeOneClass(node, c));

/**
 * A `Transition` component using CSS transitions and animations.
 * It's inspired by the excellent [ng-animate](http://www.nganimate.org/) library.
 *
 * `CSSTransition` applies a pair of class names during the `appear`, `enter`,
 * and `exit` stages of the transition. The first class is applied and then a
 * second "active" class in order to activate the css animation. After the animation,
 * matching `done` class names are applied to persist the animation state.
 *
 * When the `in` prop is toggled to `true` the Component will get
 * the `example-enter` CSS class and the `example-enter-active` CSS class
 * added in the next tick. This is a convention based on the `classNames` prop.
 */
class CSSTransition extends React.Component {
  onEnter = (node, appearing) => {
    const { className } = this.getClassNames(appearing ? 'appear' : 'enter')

    this.removeClasses(node, 'exit');
    addClass(node, className)

    if (this.props.onEnter) {
      this.props.onEnter(node, appearing)
    }
  }

  onEntering = (node, appearing) => {
    const { activeClassName } = this.getClassNames(
      appearing ? 'appear' : 'enter'
    );

    this.reflowAndAddClass(node, activeClassName)

    if (this.props.onEntering) {
      this.props.onEntering(node, appearing)
    }
  }

  onEntered = (node, appearing) => {
    const { doneClassName } = this.getClassNames('enter');

    this.removeClasses(node, appearing ? 'appear' : 'enter');
    addClass(node, doneClassName);

    if (this.props.onEntered) {
      this.props.onEntered(node, appearing)
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
    const { doneClassName } = this.getClassNames('exit');

    this.removeClasses(node, 'exit');
    addClass(node, doneClassName);

    if (this.props.onExited) {
      this.props.onExited(node)
    }
  }

  getClassNames = (type) => {
    const { classNames } = this.props;

    let className = typeof classNames !== 'string' ?
      classNames[type] : classNames + '-' + type;

    let activeClassName = typeof classNames !== 'string' ?
      classNames[type + 'Active'] : className + '-active';

    let doneClassName = typeof classNames !== 'string' ?
      classNames[type + 'Done'] : className + '-done';

    return {
      className,
      activeClassName,
      doneClassName
    };
  }

  removeClasses(node, type) {
    const { className, activeClassName, doneClassName } = this.getClassNames(type)
    className && removeClass(node, className);
    activeClassName && removeClass(node, activeClassName);
    doneClassName && removeClass(node, doneClassName);
  }

  reflowAndAddClass(node, className) {
    // This is for to force a repaint,
    // which is necessary in order to transition styles when adding a class name.
    if (className) {
      /* eslint-disable no-unused-expressions */
      node && node.scrollTop;
      /* eslint-enable no-unused-expressions */
      addClass(node, className);
    }
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

CSSTransition.propTypes = {
  ...Transition.propTypes,

  /**
   * The animation classNames applied to the component as it enters, exits or has finished the transition.
   * A single name can be provided and it will be suffixed for each stage: e.g.
   *
   * `classNames="fade"` applies `fade-enter`, `fade-enter-active`, `fade-enter-done`,
   * `fade-exit`, `fade-exit-active`, `fade-exit-done`, `fade-appear`, and `fade-appear-active`.
   * Each individual classNames can also be specified independently like:
   *
   * ```js
   * classNames={{
   *  appear: 'my-appear',
   *  appearActive: 'my-active-appear',
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
   * you might want to use camelCase in your CSS file, that way could simply spread
   * them instead of listing them one by one:
   *
   * ```js
   * classNames={{ ...styles }}
   * ```
   *
   * @type {string | {
   *  appear?: string,
   *  appearActive?: string,
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
   * 'appear' classes are **removed** and the `done` class is added to the DOM node.
   *
   * @type Function(node: HtmlElement, isAppearing: bool)
   */
  onEntered: PropTypes.func,


  /**
   * A `<Transition>` callback fired immediately after the 'exit' class is
   * applied.
   *
   * @type Function(node: HtmlElement)
   */
  onExit: PropTypes.func,

  /**
   * A `<Transition>` callback fired immediately after the 'exit-active' is applied.
   *
   * @type Function(node: HtmlElement)
   */
  onExiting: PropTypes.func,

  /**
   * A `<Transition>` callback fired immediately after the 'exit' classes
   * are **removed** and the `exit-done` class is added to the DOM node.
   *
   * @type Function(node: HtmlElement)
   */
  onExited: PropTypes.func,
};

export default CSSTransition
