import { css } from 'astroturf';
import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';

import ReplaceTransition from '../src/ReplaceTransition';
import CSSTransition from '../src/CSSTransition';

const FADE_TIMEOUT = 1000;

const styles = css`
  .enter {
    opacity: 0.01;
  }

  .enter.enter-active  {
    position: absolute;
    left: 0; right: 0;
    opacity: 1;
    transition: opacity ${FADE_TIMEOUT * 2}ms ease-in;
    transition-delay: ${FADE_TIMEOUT}ms
  }

  .exit {
    opacity: 1;
  }
  .exit.exit-active {
    opacity: 0.01;

    transition: opacity ${FADE_TIMEOUT}ms ease-in;
  }

  .box {
    padding: 20px;
    background-color: #ccc;
  }
  .container {
    position: relative;
  }
`;

const defaultProps = {
  in: false,
  delay: false,
  timeout: FADE_TIMEOUT * 2,
}

function Fade(props) {
  return (
    <CSSTransition
      {...props}
      className={styles.box}
      classNames={styles}
    />
  );
}

Fade.defaultProps = defaultProps;

export default Fade;

function Example({ children }) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <button
        onClick={() => {
          setShow(!show);
        }}
      >
        toggle (in: "{String(show)}")
      </button>
      {React.cloneElement(children, { in: show })}
    </div>
  );
}


storiesOf('Replace Transition', module)
  .add('Animates on all', () => (

    <Example>
      <ReplaceTransition
        className={styles.container}
        onEnter={() => console.log('onEnter')}
        onEntering={() => console.log('onEntering')}
        onEntered={() => console.log('onEntered')}
        onExit={() => console.log('onExit')}
        onExiting={() => console.log('onExiting')}
        onExited={() => console.log('onExited')}
      >
        <Fade><div>in True</div></Fade>
        <Fade><div>in False</div></Fade>
      </ReplaceTransition>
    </Example>
  ))
