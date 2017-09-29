import React from 'react';
import { storiesOf } from '@storybook/react';

import CSSTransition from '../src/CSSTransition';
import TransitionGroup from '../src/TransitionGroup';
import CSSTransitionGroupFixture from './CSSTransitionGroupFixture';
import NestedTransition from './NestedTransition'
import StoryFixture from './StoryFixture';

// const GREY = '#DDD';
const FADE_TIMEOUT = 3000;

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


class Fade extends React.Component {
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

storiesOf('Css Transition Group', module)
  .add('Animates on all', () => (
    <CSSTransitionGroupFixture
      description={`
        Should animate when items are added to the list but not when they are
        removed or on initial appear
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
        Should animate when items are removed to the list but not when they are
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
