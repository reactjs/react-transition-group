import React from 'react';
import CSSTransition from '../src/CSSTransition';
import StoryFixture from './StoryFixture';


const _ = css`
  .nested-fade-enter,
  .nested-fade-appear,
  .nested-fade-exit {
    transition: opacity 500ms;
  }

  .nested-fade-enter,
  .nested-fade-appear {
    opacity: 0;
  }

  .nested-fade-enter-active,
  .nested-fade-appear-active {
    opacity: 1
  }

  .nested-fade-exit {
    opacity: 1;
  }

  .nested-fade-exit-active {
    opacity: 0
  }

  .nested-scale-enter,
  .nested-scale-appear,
  .nested-scale-exit {
    transition: transform 500ms;
  }

  .nested-scale-enter,
  .nested-scale-appear {
    transform: scale(0);
  }

  .nested-scale-enter-active,
  .nested-scale-appear-active {
    transform: scale(1);
  }

  .nested-scale-exit {
    transform: scale(1);
  }

  .nested-scale-exit-active {
    transform: scale(0);
  }
`;

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

const Fade = (props) => {
  return (
    <CSSTransition
      {...props}
      timeout={500}
      classNames="nested-fade"
    />
  )
}


const Scale = (props) => {
  return (
    <CSSTransition
      {...props}
      timeout={500}
      classNames="nested-scale"
    />
  )
}


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



