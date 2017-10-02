import React from 'react';
import style from 'dom-helpers/style';

import Transition, { EXITED, ENTERED, ENTERING, EXITING }
  from '../../src/Transition';


const styles = css`
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
  [ENTERING]: styles.in,
  [ENTERED]: styles.in,
}

export const Fade = props => (
  <Transition
    {...props}
    className={styles.fade}
    timeout={150}
  >
    {status => React.cloneElement(props.children, {
      className: `${styles.fade} ${fadeStyles[status] || ''}`
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
  [EXITED]: styles.collapse,
  [EXITING]: styles.collapsing,
  [ENTERING]: styles.collapsing,
  [ENTERED]: `${styles.collapse} ${styles.in}`,
}

export class Collapse extends React.Component {
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
