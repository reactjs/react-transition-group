import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'

import StoryFixture from './StoryFixture'
import { Fade, Collapse } from './transitions/Bootstrap'

function ToggleFixture({ defaultIn, description, children }) {
  const [show, setShow] = useState(defaultIn);

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

storiesOf('Transition', module)
  .add('Bootstrap Fade', () => (
    <ToggleFixture>
      <Fade>
        <div>asaghasg asgasg</div>
      </Fade>
    </ToggleFixture>
  ))
  .add('Bootstrap Collapse', () => (
    <ToggleFixture>
      <Collapse>
        <div>
          asaghasg asgasg
          <div>foo</div>
          <div>bar</div>
        </div>
      </Collapse>
    </ToggleFixture>
  ))
