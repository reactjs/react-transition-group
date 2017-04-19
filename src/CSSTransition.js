import * as PropTypes from 'prop-types';
import addClass from 'dom-helpers/class/addClass';
import removeClass from 'dom-helpers/class/removeClass';
import React from 'react';

import Transition from './Transition';
import { classNamesShape } from './utils/PropTypes';

const propTypes = {
  classNames: classNamesShape,
  onEnter: PropTypes.func,
  onEntering: PropTypes.func,
  onEntered: PropTypes.func,

  onExit: PropTypes.func,
  onExiting: PropTypes.func,
  onExited: PropTypes.func,
};

class CSSTransition extends React.Component {
  static contextTypes = {
    transitionGroup: React.PropTypes.object,
  };

  onEnter = (node, isInitial) => {
    const appearing = this.context.transitionGroup ?
      this.context.transitionGroup.isMounting : isInitial;

    const { className } = this.getClassNames(appearing ? 'appear' : 'enter')

    this.removeClasses(node, 'exit');
    addClass(node, className)

    if (this.props.onEnter) {
      this.props.onEnter(node)
    }
  }

  onEntering = (node, isInitial) => {
    const appearing = this.context.transitionGroup ?
      this.context.transitionGroup.isMounting : isInitial;

    const { activeClassName } = this.getClassNames(
      appearing ? 'appear' : 'enter'
    );

    this.reflowAndAddClass(node, activeClassName)

    if (this.props.onEntering) {
      this.props.onEntering(node)
    }
  }

  onEntered = (node, isInitial) => {
    const appearing = this.context.transitionGroup ?
      this.context.transitionGroup.isMounting : isInitial;

    this.removeClasses(node, appearing ? 'appear' : 'enter');

    if (this.props.onEntered) {
      this.props.onEntered(node)
    }
  }

  onExit = (node) => {
    const { className } = this.getClassNames('exit')

    this.removeClasses(node, 'appear');
    this.removeClasses(node, 'exit');
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

    let className = classNames[type] || classNames + '-' + type;

    return {
      className,
      activeClassName: classNames[type + 'Active'] || className + '-active',
    }
  }

  removeClasses(node, type) {
    const { className, activeClassName } = this.getClassNames(type)
    removeClass(node, className);
    removeClass(node, activeClassName);
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
    return (
      <Transition
        {...this.props}
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
