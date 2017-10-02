import React from 'react';
import { storiesOf } from '@storybook/react';

import ReplaceTransition from '../src/ReplaceTransition';
import CSSTransition from '../src/CSSTransition';

const FADE_TIMEOUT = 1000;

let styles = css`
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

export default class Fade extends React.Component {
  static defaultProps = {
    in: false,
    delay: false,
    timeout: FADE_TIMEOUT * 2,
  };
  render() {
    const { ...props } = this.props;
    return (
      <CSSTransition
        {...props}
        className={styles.box}
        classNames={styles}
      />
    );
  }
}

class Example extends React.Component {
  state = { in: false }
  render() {
    return (
      <div>
        <button onClick={() => this.setState(p => ({ in: !p.in })) }>
          toggle (in: "{String(this.state.in)}")
        </button>
        {React.cloneElement(this.props.children, this.state)}
      </div>
    );
  }
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
