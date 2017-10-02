import React from 'react';

import CSSTransition from '../../src/CSSTransition';

export const SCALE_TIMEOUT = 1000;

let styles = css`
  .enter,
  .appear {
    transform: scale(0);
  }
  .enter.enter-active,
  .appear.appear-active {
    transform: scale(1);
    transition: transform ${SCALE_TIMEOUT}ms;
  }

  .exit {
    transform: scale(1);
  }

  .exit.exit-active {
    transform: scale(0);
    transition: transform ${SCALE_TIMEOUT}ms;
  }
`;

export default class Scale extends React.Component {
  static defaultProps = {
    in: false,
    timeout: SCALE_TIMEOUT,
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
