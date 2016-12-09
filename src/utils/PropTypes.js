import React from 'react';

export function transitionTimeout(transitionType) {
  let timeoutPropName = 'transition' + transitionType + 'Timeout';
  let enabledPropName = 'transition' + transitionType;

  return (props) => {
    // If the transition is enabled
    if (props[enabledPropName]) {
      // If no timeout duration is provided
      if (props[timeoutPropName] == null) {
        return new Error(
          timeoutPropName + ' wasn\'t supplied to CSSTransitionGroup: ' +
          'this can cause unreliable animations and won\'t be supported in ' +
          'a future version of React. See ' +
          'https://fb.me/react-animation-transition-group-timeout for more ' +
          'information.',
        );

      // If the duration isn't a number
      } else if (typeof props[timeoutPropName] !== 'number') {
        return new Error(timeoutPropName + ' must be a number (in milliseconds)');
      }
    }

    return null;
  };
}

export const nameShape = React.PropTypes.oneOfType([
  React.PropTypes.string,
  React.PropTypes.shape({
    enter: React.PropTypes.string,
    leave: React.PropTypes.string,
    active: React.PropTypes.string,
  }),
  React.PropTypes.shape({
    enter: React.PropTypes.string,
    enterActive: React.PropTypes.string,
    leave: React.PropTypes.string,
    leaveActive: React.PropTypes.string,
    appear: React.PropTypes.string,
    appearActive: React.PropTypes.string,
  }),
]);
