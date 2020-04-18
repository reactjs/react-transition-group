import { css } from 'astroturf';
import React from 'react';

import CSSTransition from '../../src/CSSTransition';

export const SCALE_TIMEOUT = 1000;

const styles = css`
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

const defaultProps = {
  in: false,
  timeout: SCALE_TIMEOUT,
};

function Scale(props) {
  return <CSSTransition {...props} classNames={styles} />;
}

Scale.defaultProps = defaultProps;

export default Scale;
