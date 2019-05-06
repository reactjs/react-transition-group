import React from 'react';
import { storiesOf } from '@storybook/react';

import TransitionGroup from '../src/TransitionGroup';
import CSSTransitionGroupFixture from './CSSTransitionGroupFixture';
import NestedTransition from './NestedTransition'
import StoryFixture from './StoryFixture';
import Fade, { FADE_TIMEOUT } from './transitions/Fade';


storiesOf('Css Transition Group', module)
  .add('Animates on all', () => (
    <CSSTransitionGroupFixture
      description={`
        Should animate on appear, add, and remove
      `}
      appear
      items={[ 'Item number: 1' ]}
    >
      <Fade />
    </CSSTransitionGroupFixture>
  ))
  .add('Animates on enter', () => (
    <CSSTransitionGroupFixture
      description={`
        Should animate when items are added to the list but not when they are
        removed or on initial appear
      `}
      exit={false}
      timeout={{ enter: FADE_TIMEOUT }}
      items={[ 'Item number: 1' ]}
    >
      <Fade  />
    </CSSTransitionGroupFixture>
  ))
  .add('Animates on exit', () => (
    <CSSTransitionGroupFixture
      description={`
        Should animate when items are removed from the list but not when they are
        added or on initial appear
      `}
      items={[
        'Item number: 1',
        'Item number: 2',
        'Item number: 3',
      ]}
    >
      <Fade enter={false} timeout={{ exit: FADE_TIMEOUT }} />
    </CSSTransitionGroupFixture>
  ))
  .add('Animates on appear', () => (
    <CSSTransitionGroupFixture
      description={`
        Should animate when items first mount but not when added or removed
      `}
      appear
      items={[
        'Item number: 1',
        'Item number: 2',
        'Item number: 3',
      ]}
    >
      <Fade exit={false} enter={false} />
    </CSSTransitionGroupFixture>
  ))
  .add('Dynamic props', () => (
    <StoryFixture
      description={`
        Updates to children should not break animations
      `}
    >
      <DynamicTransition />
    </StoryFixture>
  ))
  .add('Re-entering while leaving', () => (
    <StoryFixture
      description={`
        Should animate when items first mount but not when added or removed
      `}
    >
      <RenterTransition />
    </StoryFixture>
  ))
  .add('Nested Transitions', () => (
    <NestedTransition />
  ))
  ;

class DynamicTransition extends React.Component {
  state = { count: 0 }
  handleClick = () => {
    this.setState({ hide: !this.state.hide })
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState({ count: this.state.count + 1 })
    }, 700);
  }
  componentWillUnmount() { clearInterval(this.interval); }

  render() {
    const { hide, count } = this.state
    return (
      <div>
        <button onClick={this.handleClick}>Toggle item</button>
        <TransitionGroup timeout={FADE_TIMEOUT}>
          {!hide &&
            <Fade key='item'>
              <div>Changing! {count}</div>
            </Fade>
          }
        </TransitionGroup>
      </div>
    )
  }
}

class RenterTransition extends React.Component {
  handleClick = () => {
    this.setState({ hide: true }, () => {
      setTimeout(() => {
        console.log('re-entering!')
        this.setState({ hide: false })
      }, FADE_TIMEOUT / 2);
    })
  }
  render() {
    const { hide } = this.state || {}
    return (
      <div>
        <button onClick={this.handleClick}>Remove and re-add</button>
        <TransitionGroup timeout={FADE_TIMEOUT}>
          {!hide &&
            <Fade key='item'>
              <div>I'm entering!</div>
            </Fade>
          }
        </TransitionGroup>
      </div>
    )
  }
}
