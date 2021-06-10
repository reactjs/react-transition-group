import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';

import StoryFixture from './StoryFixture';
import {
  Fade,
  Collapse,
  FadeForwardRef,
  FadeInnerRef,
} from './transitions/Bootstrap';

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
      <Fade>asaghasg asgasg</Fade>
    </ToggleFixture>
  ))
  .add('Bootstrap Collapse', () => (
    <ToggleFixture>
      <Collapse>
        asaghasg asgasg
        <div>foo</div>
        <div>bar</div>
      </Collapse>
    </ToggleFixture>
  ))
  .add('Fade using React.forwardRef', () => {
    const nodeRef = React.createRef();
    return (
      <ToggleFixture>
        <FadeForwardRef ref={nodeRef}>
          Fade using React.forwardRef
        </FadeForwardRef>
      </ToggleFixture>
    );
  })
  .add('Fade using innerRef', () => {
    const nodeRef = React.createRef();
    return (
      <ToggleFixture>
        <FadeInnerRef innerRef={nodeRef}>Fade using innerRef</FadeInnerRef>
      </ToggleFixture>
    );
  });
