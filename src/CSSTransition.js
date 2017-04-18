import React from 'react';
import addClass from 'dom-helpers/class/addClass';
import removeClass from 'dom-helpers/class/removeClass';
import raf from 'dom-helpers/util/requestAnimationFrame';

import Transition from './Transition';
import { classNamesShape } from './utils/PropTypes';

const propTypes = {
  classNames: classNamesShape,
  onEnter: React.PropTypes.func,
  onEntered: React.PropTypes.func,

  onExit: React.PropTypes.func,
  onExited: React.PropTypes.func,
};

class CSSTransition extends React.Component {
  static contextTypes = {
    transitionGroup: React.PropTypes.object,
  };

  constructor(...args) {
    super(...args);

    this.classNameAndNodeQueue = [];
    this.transitionTimeouts = [];
  }

  componentWillUnmount() {
    this.unmounted = true;

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.transitionTimeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });

    this.classNameAndNodeQueue.length = 0;
  }

  onTransitionStart(node, animationType) {
    const { className, activeClassName } = this.getClassNames(animationType)

    addClass(node, className);

    this.queueClassAndNode(activeClassName, node);
  }

  onTransitionEnd(node, animationType) {
    const { className, activeClassName } = this.getClassNames(animationType)
    removeClass(node, className);
    removeClass(node, activeClassName);
  }

  onEnter = (node, isInitial) => {
    const appearing = this.context.transitionGroup ?
      this.context.transitionGroup.mounting : isInitial;

    this.onTransitionEnd(node, 'exit'); // just in case
    this.onTransitionStart(node, appearing ? 'appear' : 'enter');
    if (this.props.onEnter) {
      this.props.onEnter(node)
    }
  }

  onEntered = (node, isInitial) => {
    const appearing = this.context.transitionGroup ?
      this.context.transitionGroup.mounting : isInitial;

    this.onTransitionEnd(node, appearing ? 'appear' : 'enter');

    if (this.props.onEntered) {
      this.props.onEntered(node)
    }
  }

  onExit = (node) => {
    this.onTransitionEnd(node, 'appear');
    this.onTransitionEnd(node, 'enter');
    this.onTransitionStart(node, 'exit');
    if (this.props.onExit) {
      this.props.onExit(node)
    }
  }

  onExited = (node) => {
    this.onTransitionEnd(node, 'exit');
    if (this.props.onExited) {
      this.props.onExited(node)
    }
  }

  getClassNames = (type) => {
    const { classNames } = this.props

    let className = classNames[type] || classNames + '-' + type;

    return {
      className,
      activeClassName: classNames[type + 'Active'] || className + '-active',
    }
  }

  queueClassAndNode(className, node) {
    this.classNameAndNodeQueue.push({
      className,
      node,
    });

    if (!this.rafHandle) {
      this.rafHandle = raf(() => this.flushClassNameAndNodeQueue());
    }
  }

  flushClassNameAndNodeQueue() {
    if (!this.unmounted) {
      this.classNameAndNodeQueue.forEach((obj) => {
        // This is for to force a repaint,
        // which is necessary in order to transition styles when adding a class name.
        /* eslint-disable no-unused-expressions */
        obj.node.scrollTop;
        /* eslint-enable no-unused-expressions */
        addClass(obj.node, obj.className);
      });
    }
    this.classNameAndNodeQueue.length = 0;
    this.rafHandle = null;
  }

  render() {
    return (
      <Transition
        {...this.props}
        onEnter={this.onEnter}
        onEntered={this.onEntered}
        onExit={this.onExit}
        onExited={this.onExited}
      />
    );
  }
}

CSSTransition.propTypes = propTypes;

export default CSSTransition
