import React from 'react';

import CSSTransition from '../../src/CSSTransition';

export const FADE_TIMEOUT = 3000;

let styles = css`
  .enter,
  .appear {
    opacity: 0.01;
  }

  .enter.enter-active,
  .appear.appear-active  {
    opacity: 1;
    transition: opacity 1000ms ease-in;
  }

  .exit {
    opacity: 1;
  }
  .exit.exit-active {
    opacity: 0.01;
    transition: opacity 800ms ease-in;
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
        classNames={styles}
      />
    );
  }
}
