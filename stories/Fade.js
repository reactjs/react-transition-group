import React from 'react';

import CSSTransition from '../src/CSSTransition';

export const FADE_TIMEOUT = 3000;

let _ = css`
  .fade-enter,
  .fade-appear,
  .fade-exit {
    transition: all ${FADE_TIMEOUT}ms;
  }
  .fade-enter,
  .fade-appear {
    opacity: 0;
  }
  .fade-enter-active,
  .fade-appear-active {
    opacity: 1
  }
  .fade-exit {
    transition: all ${FADE_TIMEOUT}ms;
    opacity: 1;
  }
  .fade-exit-active {
    opacity: 0
  }
`;


export default class Fade extends React.Component {
  static defaultProps = {
    in: false,
    timeout: FADE_TIMEOUT,
  };
  render() {
    return (
      <CSSTransition
        {...this.props}
        classNames="fade"
      />
    );
  }
}
