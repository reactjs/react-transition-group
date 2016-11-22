import addClass from 'dom-helpers/class/addClass';
import removeClass from 'dom-helpers/class/removeClass';
import raf from 'dom-helpers/util/requestAnimationFrame';
import React from 'react';
import { findDOMNode } from 'react-dom';

import { nameShape } from './utils/PropTypes';

const propTypes = {
  children: React.PropTypes.node,
  name: nameShape.isRequired,

  // Once we require timeouts to be specified, we can remove the
  // boolean flags (appear etc.) and just accept a number
  // or a bool for the timeout flags (appearTimeout etc.)
  appear: React.PropTypes.bool,
  enter: React.PropTypes.bool,
  leave: React.PropTypes.bool,
  appearTimeout: React.PropTypes.number,
  enterTimeout: React.PropTypes.number,
  leaveTimeout: React.PropTypes.number,
};

class CSSTransitionGroupChild extends React.Component {

  static displayName = 'CSSTransitionGroupChild';

  componentWillMount() {
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
    let timer = null;

    addClass(node, className);

    // Need to do this to actually trigger a transition.
    this.queueClassAndNode(activeClassName, node);

    // Clean-up the animation after the specified delay
    timer = setTimeout((e) => {
      if (e && e.target !== node) {
        return;
      }

      clearTimeout(timeout);
      removeClass(node, className);
      removeClass(node, activeClassName);

      // Usually this optional callback is used for informing an owner of
      // a leave animation and telling it to remove the child.
      if (finishCallback) {
        finishCallback();
      }
    }, timeout);

    this.transitionTimeouts.push(timer);
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
        addClass(obj.node, obj.className);
      });
    }
    this.classNameAndNodeQueue.length = 0;
    this.rafHandle = null;
  }

  componentWillAppear = (done) => {
    if (this.props.appear) {
      this.transition('appear', done, this.props.appearTimeout);
    } else {
      done();
    }
  }

  componentWillEnter = (done) => {
    if (this.props.enter) {
      this.transition('enter', done, this.props.enterTimeout);
    } else {
      done();
    }
  }

  componentWillLeave = (done) => {
    if (this.props.leave) {
      this.transition('leave', done, this.props.leaveTimeout);
    } else {
      done();
    }
  }

  render() {
    return React.Children.only(this.props.children);
  }
}

CSSTransitionGroupChild.propTypes = propTypes;

export default CSSTransitionGroupChild;
