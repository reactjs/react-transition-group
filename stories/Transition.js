import React from 'react';
import style from 'dom-helpers/style';
import { storiesOf } from '@kadira/storybook';

import Transition from '../src/Transition';
import CSSTransition from '../src/CSSTransition';
import StoryFixture from './StoryFixture';

const _ = css`
  .fade {
    opacity: 0;
    transition: opacity .15s linear;
  }
  .fade.in {
    opacity: 1;
  }

  .collapse {
    display: none;
  }
  .collapse.in { display: block; }

  .collapsing {
    position: relative;
    height: 0;
    overflow: hidden;
    transition: height, visibility .35s ease;
  }
`;

const Fade = props => (
  <Transition
    {...props}
    className="fade"
    timeout={150}
    onEntering={node => node.classList.add('in')}
    onExit={node => node.classList.remove('in')}
  />
)

function getHeight(elem) {
  let value = elem.offsetHeight;
  let margins = ['marginTop', 'marginBottom'];

  return (value +
    parseInt(style(elem, margins[0]), 10) +
    parseInt(style(elem, margins[1]), 10)
  );
}


class Collapse extends React.Component {
  /* -- Expanding -- */
  handleEnter = (elem) => {
    elem.style.height = '0';
  }

  handleEntering = (elem) => {
    elem.classList.add('collapsing')
    elem.style.height = `${elem.scrollHeight}px`;
  }

  handleEntered = (elem) => {
    elem.classList.remove('collapsing')
    elem.classList.add('collapse', 'in')
    elem.style.height = null;
  }

  /* -- Collapsing -- */
  handleExit = (elem) => {
    elem.style.height = getHeight(elem) + 'px';
    elem.offsetHeight; // eslint-disable-line no-unused-expressions
  }

  handleExiting = (elem) => {
    elem.classList.add('collapsing')
    elem.style.height = '0';
  }

  handleExited = (elem) => {
    elem.classList.remove('collapsing')
  }

  render() {
    return (
      <Transition
        {...this.props}
        timeout={350}
        className="collapse"
        onEnter={this.handleEnter}
        onEntering={this.handleEntering}
        onEntered={this.handleEntered}
        onExit={this.handleExit}
        onExiting={this.handleExiting}
        onExited={this.handleExited}
      />
    );
  }
}

class ToggleFixture extends React.Component {
  state = { show: this.props.defaultIn }
  render() {
    return (
      <StoryFixture description={this.props.description}>
        <div style={{ marginBottom: 10 }}>
          <button
            onClick={() => this.setState(({ show }) => ({
              show: !show
            }))}
          >
            Toggle
          </button>
        </div>
        {React.cloneElement(this.props.children, {
          in: this.state.show
        })}
      </StoryFixture>
    )
  }
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
  ));
