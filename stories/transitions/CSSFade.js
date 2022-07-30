import { css } from 'astroturf';
import React, { useRef } from 'react';

import CSSTransition from '../../src/CSSTransition';

export const FADE_TIMEOUT = 1000;

const styles = css`
  .default {
    opacity: 0;
  }
  .enter-done {
    opacity: 1;
  }

  .enter,
  .appear {
    opacity: 0.01;
  }

  .enter.enter-active,
  .appear.appear-active {
    opacity: 1;
    transition: opacity ${FADE_TIMEOUT}ms ease-in;
  }

  .exit {
    opacity: 1;
  }
  .exit.exit-active {
    opacity: 0.01;
    transition: opacity ${0.8 * FADE_TIMEOUT}ms ease-in;
  }
`;

const defaultProps = {
  in: false,
  timeout: FADE_TIMEOUT,
};
function Fade(props) {
  const nodeRef = useRef();
  return (
    <CSSTransition {...props} classNames={styles} nodeRef={nodeRef}>
      <div ref={nodeRef} className={styles.default}>
        {props.children}
      </div>
    </CSSTransition>
  );
}

Fade.defaultProps = defaultProps;

export default Fade;
