import React from 'react';
import style from 'dom-helpers/style';
import { storiesOf } from '@storybook/react';

import Transition, { EXITED, ENTERED, ENTERING, EXITING } from '../src/Transition';
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
    transition: .35s ease;
    transition-property: height, visibility;
  }
`;


const fadeStyles = {
  [ENTERING]: 'in',
  [ENTERED]: 'in',
}

const Fade = props => (
  <Transition
    {...props}
    className="fade"
    timeout={150}
  >
    {status => React.cloneElement(props.children, {
      className: `fade ${fadeStyles[status] || ''}`
    })}
  </Transition>
)

function getHeight(elem) {
  let value = elem.offsetHeight;
  let margins = ['marginTop', 'marginBottom'];

  return (value +
    parseInt(style(elem, margins[0]), 10) +
    parseInt(style(elem, margins[1]), 10)
  );
}


const collapseStyles = {
  [EXITED]: 'collapse',
  [EXITING]: 'collapsing',
  [ENTERING]: 'collapsing',
  [ENTERED]: 'collapse in',
}

class Collapse extends React.Component {
  /* -- Expanding -- */
  handleEnter = (elem) => {
    elem.style.height = '0';
  }

  handleEntering = (elem) => {
    elem.style.height = `${elem.scrollHeight}px`;
  }

  handleEntered = (elem) => {
    elem.style.height = null;
  }

  /* -- Collapsing -- */
  handleExit = (elem) => {
    elem.style.height = getHeight(elem) + 'px';
    elem.offsetHeight; // eslint-disable-line no-unused-expressions
  }

  handleExiting = (elem) => {
    elem.style.height = '0';
  }

  render() {
    const { children } = this.props;
    return (
      <Transition
        {...this.props}
        timeout={350}
        onEnter={this.handleEnter}
        onEntering={this.handleEntering}
        onEntered={this.handleEntered}
        onExit={this.handleExit}
        onExiting={this.handleExiting}
      >
        {(state, props) => React.cloneElement(children, {
          ...props,
          className: collapseStyles[state]
        })}
      </Transition>
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
