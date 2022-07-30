import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';

import StoryFixture from './StoryFixture';
import Fade from './transitions/CSSFade';

function ToggleFixture({ defaultIn, description, children }) {
  const [show, setShow] = useState(defaultIn || false);

  return (
    <StoryFixture description={description}>
      <div style={{ marginBottom: 10 }}>
        <button
          onClick={() => {
            setShow(!show);
          }}
        >
          Toggle
        </button>
      </div>
      {React.cloneElement(children, { in: show })}
    </StoryFixture>
  );
}

storiesOf('CSSTransition', module)
  .add('Fade', () => (
    <ToggleFixture>
      <Fade>asaghasg asgasg</Fade>
    </ToggleFixture>
  ))
  .add('Fade with appear', () => (
    <ToggleFixture defaultIn>
      <Fade appear>asaghasg asgasg</Fade>
    </ToggleFixture>
  ))
  .add('Fade with mountOnEnter', () => {
    return (
      <ToggleFixture>
        <Fade mountOnEnter>Fade with mountOnEnter</Fade>
      </ToggleFixture>
    );
  })
  .add('Fade with unmountOnExit', () => {
    return (
      <ToggleFixture>
        <Fade unmountOnExit>Fade with unmountOnExit</Fade>
      </ToggleFixture>
    );
  });
