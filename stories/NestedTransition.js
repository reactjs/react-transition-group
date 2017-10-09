import React from 'react';
import StoryFixture from './StoryFixture';

import Fade from './transitions/Fade';
import Scale from './transitions/Scale';

const FadeAndScale = (props) => (
  <Fade {...props}>
    <div>
      <div>I will fade</div>
      {/*
        We also want to scale in at the same time so we pass the `in` state here as well, so it enters
        at the same time as the Fade.

        Note also the `appear` since the Fade will happen when the item mounts, the Scale transition
        will mount at the same time as the div we want to scale, so we need to tell it to animate as
        it _appears_.
      */}
      <Scale in={props.in} appear>
        <div>I should scale</div>
      </Scale>
    </div>
  </Fade>
)


export default class Example extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = { showNested: false };
  }

  toggleNested = () => {
    this.setState({ showNested: !this.state.showNested })
  }

  render() {
    return (
      <StoryFixture description="nested Transtions">
        <h3>Nested Animations</h3>
        <button onClick={this.toggleNested}>
          Click to see 2 nested animations
        </button>
        <FadeAndScale in={this.state.showNested} mountOnEnter unmountOnExit />
      </StoryFixture>
    );
  }
}



