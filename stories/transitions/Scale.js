import { css } from 'astroturf';
import React, { useRef } from 'react';

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
  const nodeRef = useRef();
  return (
    <CSSTransition {...props} classNames={styles} nodeRef={nodeRef}>
      <div ref={nodeRef}>{props.children}</div>
    </CSSTransition>
  );
}

Scale.defaultProps = defaultProps;

export default Scale;
