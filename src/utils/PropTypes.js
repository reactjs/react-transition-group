import React from 'react';

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
