import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import ReplaceTransition from '../src/ReplaceTransition';
import Fade, { FADE_TIMEOUT } from './Fade';


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
