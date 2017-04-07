import React from 'react';

import TransitionGroup from './TransitionGroup';
import CSSTransitionGroupChild from './CSSTransitionGroupChild';
import { nameShape, transitionTimeout, _extends } from './utils/PropTypes';

const propTypes = {
  transitionName: nameShape.isRequired,

  transitionAppear: React.PropTypes.bool,
  transitionEnter: React.PropTypes.bool,
  transitionLeave: React.PropTypes.bool,
  transitionAppearTimeout: transitionTimeout('Appear'),
  transitionEnterTimeout: transitionTimeout('Enter'),
  transitionLeaveTimeout: transitionTimeout('Leave'),
};

const defaultProps = {
  transitionAppear: false,
  transitionEnter: true,
  transitionLeave: true,
};

class CSSTransitionGroup extends React.Component {

  static displayName = 'CSSTransitionGroup';

  // We need to provide this childFactory so that
  // ReactCSSTransitionGroupChild can receive updates to name, enter, and
  // leave while it is leaving.
  _wrapChild = child => (
    React.createElement(
      CSSTransitionGroupChild,
      {
        name: this.props.transitionName,
        appear: this.props.transitionAppear,
        enter: this.props.transitionEnter,
        leave: this.props.transitionLeave,
        appearTimeout: this.props.transitionAppearTimeout,
        enterTimeout: this.props.transitionEnterTimeout,
        leaveTimeout: this.props.transitionLeaveTimeout,
      },
      child,
    )
  );

  render() {
    return React.createElement(
      TransitionGroup,
      _extends({}, this.props, { childFactory: this._wrapChild }),
    );
  }
}

CSSTransitionGroup.propTypes = propTypes;
CSSTransitionGroup.defaultProps = defaultProps;

export default CSSTransitionGroup;
