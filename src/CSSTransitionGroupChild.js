import addClass from 'dom-helpers/class/addClass';
import removeClass from 'dom-helpers/class/removeClass';
import raf from 'dom-helpers/util/requestAnimationFrame';
import { transitionEnd, animationEnd } from 'dom-helpers/transition/properties';
import React from 'react';
import { findDOMNode } from 'react-dom';

import { nameShape } from './utils/PropTypes';


function onTransitionEnd(node, timeout, handler) {
  let timeoutTimer;

  function clearHandlers() {
    clearTimeout(timeoutTimer);
    timeoutTimer = null;
    /* eslint-disable no-use-before-define */
    node.removeEventListener(transitionEnd, finish);
    node.removeEventListener(animationEnd, finish);
    /* eslint-enable no-use-before-define */
  }

  function finish(event) {
    if (event && event.target !== node) return;

    clearHandlers();
    handler();
  }

  if (!transitionEnd) {
    timeout = 0;
  }

  timeoutTimer = setTimeout(finish, timeout);

  if (transitionEnd) {
    node.addEventListener(animationEnd, finish, false);
    node.addEventListener(transitionEnd, finish, false);
  }

  return clearHandlers;
}


const propTypes = {
  children: React.PropTypes.node,
  name: nameShape.isRequired,

  appearTimeout: React.PropTypes.number,
  enterTimeout: React.PropTypes.number,
  leaveTimeout: React.PropTypes.number,
};

class CSSTransitionGroupChild extends React.Component {

  static displayName = 'CSSTransitionGroupChild';

  componentWillMount() {
    this.classNameAndNodeQueue = [];
    this.clearTransitions = [];
    this.pendingRafs = [];
  }

  componentWillUnmount() {
    this.unmounted = true;

    this.clearTransitions.forEach((clear) => {
      clear();
    });

    this.classNameAndNodeQueue.length = 0;
  }

  transition(animationType, finishCallback, timeout) {
    let node = findDOMNode(this);

    if (!node) {
      if (finishCallback) {
        finishCallback();
      }
      return;
    }

    let className = this.props.name[animationType] || this.props.name + '-' + animationType;
    let activeClassName = this.props.name[animationType + 'Active'] || className + '-active';

    addClass(node, className);
    this.queueClassAndNode(activeClassName, node);

    this.clearTransitions.push(
      onTransitionEnd(node, timeout, () => {
        removeClass(node, className);
        removeClass(node, activeClassName);

        // Usually this optional callback is used for informing an owner of
        // a leave animation and telling it to remove the child.
        if (finishCallback) {
          finishCallback();
        }
      }),
    );
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
      let first = this.classNameAndNodeQueue[0];

      first && first.node.offsetHeight;
      this.classNameAndNodeQueue.forEach((obj) => {
        addClass(obj.node, obj.className);
      });
    }
    this.classNameAndNodeQueue.length = 0;
    this.rafHandle = null;
  }

  componentWillAppear = (done) => {
    if (this.props.appearTimeout != null) {
      this.transition('appear', done, this.props.appearTimeout);
    } else {
      done();
    }
  }

  componentWillEnter = (done) => {
    if (this.props.enterTimeout != null) {
      this.transition('enter', done, this.props.enterTimeout);
    } else {
      done();
    }
  }

  componentWillLeave = (done) => {
    if (this.props.leaveTimeout != null) {
      this.transition('leave', done, this.props.leaveTimeout);
    } else {
      done();
    }
  }

  render() {
    const props = { ...this.props };
    delete props.name;

    delete props.appearTimeout;
    delete props.enterTimeout;
    delete props.leaveTimeout;
    delete props.children;

    return React.cloneElement(React.Children.only(this.props.children), props);
  }
}

CSSTransitionGroupChild.propTypes = propTypes;

export default CSSTransitionGroupChild;
