import React from 'react';

import TransitionGroup from './TransitionGroup';
import CSSTransitionGroupChild from './CSSTransitionGroupChild';
import { nameShape } from './utils/PropTypes';

const transitionPropType = React.PropTypes.oneOfType([
  React.PropTypes.bool,
  React.PropTypes.number,
]);

const propTypes = {
  name: nameShape.isRequired,

  timeout: (props, ...rest) => {
    let propType = React.PropTypes.number;

    if (
      props.appearTimeout === true ||
      props.enterTimeout === true ||
      props.leaveTimeout === true
    ) {
      propType = propType.isRequired;
    }

    return propType(props, ...rest);
  },

  appearTransition: transitionPropType.isRequired,
  enterTransition: transitionPropType.isRequired,
  leaveTransition: transitionPropType.isRequired,
};

const defaultProps = {
  appearTransition: false,
  enterTransition: true,
  leaveTransition: true,
};

class CSSTransitionGroup extends React.Component {

  getTimeout = (timeout) => {
    if (timeout === false) return null;
    return timeout === true ? this.props.timeout : timeout;
  };

  // We need to provide this childFactory so that
  // ReactCSSTransitionGroupChild can receive updates to name, enter, and
  // leave while it is leaving.
  renderChild = (child) => {
    const {
      name, appearTransition, enterTransition, leaveTransition
    } = this.props;

    return (
      <CSSTransitionGroupChild
        name={name}
        appearTimeout={this.getTimeout(appearTransition)}
        enterTimeout={this.getTimeout(enterTransition)}
        leaveTimeout={this.getTimeout(leaveTransition)}
      >
        {child}
      </CSSTransitionGroupChild>
    );
  }

  render() {
    let props = { ...this.props };

    delete props.timeout;
    delete props.name;
    delete props.childFactory;
    delete props.leaveTransition;
    delete props.enterTransition;
    delete props.appearTransition;

    return (
      <TransitionGroup
        {...props}
        childFactory={this.renderChild}
      />
    );
  }
}

CSSTransitionGroup.propTypes = propTypes;
CSSTransitionGroup.defaultProps = defaultProps;

export default CSSTransitionGroup;
