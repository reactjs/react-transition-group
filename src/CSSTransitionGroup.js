import React from 'react';

import TransitionGroup from './TransitionGroup';
import CSSTransitionGroupChild from './CSSTransitionGroupChild';
import { transitionTimeout } from './utils/PropTypes';


class CSSTransitionGroup extends React.Component {
  static displayName = 'CSSTransitionGroup';

  static propTypes = {
    transitionName: CSSTransitionGroupChild.propTypes.name,

    transitionAppear: React.PropTypes.bool,
    transitionEnter: React.PropTypes.bool,
    transitionLeave: React.PropTypes.bool,
    transitionAppearTimeout: transitionTimeout('Appear'),
    transitionEnterTimeout: transitionTimeout('Enter'),
    transitionLeaveTimeout: transitionTimeout('Leave'),
  };

  static defaultProps = {
    transitionAppear: false,
    transitionEnter: true,
    transitionLeave: true,
  };

  _wrapChild = (child) => {
    // We need to provide this childFactory so that
    // ReactCSSTransitionGroupChild can receive updates to name, enter, and
    // leave while it is leaving.
    return React.createElement(
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
      child
    );
  };

  render() {
    return React.createElement(
      TransitionGroup,
      Object.assign({}, this.props, { childFactory: this._wrapChild })
    );
  }
}

export default CSSTransitionGroup;
