import React from 'react';
import { storiesOf } from '@kadira/storybook';

import CSSTransitionGroupFixture from './CSSTransitionGroupFixture';

const GREY = '#DDD';
const FADE_TIMEOUT = 800;

let _ = css`
  .fade-enter,
  .fade-appear,
  .fade-leave {
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

  .fade-leave {
    transition: all ${FADE_TIMEOUT}ms;
    opacity: 1;
  }

  .fade-leave-active {
    opacity: 0
  }
`;


storiesOf('Css Transition Group', module)
  .add('Animates on all', () => (
    <CSSTransitionGroupFixture
      description={`
        Should animate when items are added to the list but not when they are
        removed or on initial appear
      `}

      name="fade"
      className="fade"
      timeout={FADE_TIMEOUT}
    />
  ))
  .add('Animates on enter', () => (
    <CSSTransitionGroupFixture
      description={`
        Should animate when items are added to the list but not when they are
        removed or on initial appear
      `}

      name="fade"
      className="fade"
      timeout={FADE_TIMEOUT}
      leaveTransition={false}
    />
  ))
  .add('Animates on leave', () => (
    <CSSTransitionGroupFixture
      description={`
        Should animate when items are removed to the list but not when they are
        added or on initial appear
      `}

      name="fade"
      className="fade"
      timeout={FADE_TIMEOUT}
      enterTransition={false}
      items={[
        'Item number: 1',
        'Item number: 2',
        'Item number: 3',
      ]}
    />
  ))
  .add('Animates on appear', () => (
    <CSSTransitionGroupFixture
      description={`
        Should animate when items first mount but not when added or removed
      `}
      name="fade"
      className="fade"
      timeout={FADE_TIMEOUT}
      appearTransition
      enterTransition={false}
      leaveTransition={false}
      items={[
        'Item number: 1',
        'Item number: 2',
        'Item number: 3',
      ]}
    />
  ));
