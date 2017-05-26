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
    Object.keys(propTypes).forEach(key => delete props[key]);
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
