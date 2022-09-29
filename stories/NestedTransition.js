import React, { useState } from 'react';

import StoryFixture from './StoryFixture';
import Fade from './transitions/CSSFadeForTransitionGroup';
import Scale from './transitions/Scale';

function FadeAndScale(props) {
  return (
    <Fade {...props}>
      <div>I will fade</div>
      {/*
          We also want to scale in at the same time so we pass the `in` state here as well, so it enters
          at the same time as the Fade.

          Note also the `appear` since the Fade will happen when the item mounts, the Scale transition
          will mount at the same time as the div we want to scale, so we need to tell it to animate as
          it _appears_.
        */}
      <Scale in={props.in} appear>
        I should scale
      </Scale>
    </Fade>
  );
}

function Example() {
  const [showNested, setShowNested] = useState(false);

  return (
    <StoryFixture description="nested Transitions">
      <h3>Nested Animations</h3>
      <button
        onClick={() => {
          setShowNested(!showNested);
        }}
      >
        Click to see 2 nested animations
      </button>
      <FadeAndScale in={showNested} mountOnEnter unmountOnExit />
    </StoryFixture>
  );
}

export default Example;
