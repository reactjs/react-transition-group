import { css } from 'astroturf';
import React, { useEffect, useRef } from 'react';
import style from 'dom-helpers/css';

import Transition, {
  EXITED,
  ENTERED,
  ENTERING,
  EXITING,
} from '../../src/Transition';

const styles = css`
  .fade {
    opacity: 0;
    transition: opacity 0.15s linear;
  }
  .fade.in {
    opacity: 1;
  }

  .collapse {
    display: none;
  }

  .collapse.in {
    display: block;
  }

  .collapsing {
    position: relative;
    height: 0;
    overflow: hidden;
    transition: 0.35s ease;
    transition-property: height, visibility;
  }
`;

const fadeStyles = {
  [ENTERING]: styles.in,
  [ENTERED]: styles.in,
};

export function Fade(props) {
  const nodeRef = useRef();
  return (
    <Transition
      {...props}
      nodeRef={nodeRef}
      className={styles.fade}
      timeout={150}
    >
      {(status) => (
        <div
          ref={nodeRef}
          className={`${styles.fade} ${fadeStyles[status] || ''}`}
        >
          {props.children}
        </div>
      )}
    </Transition>
  );
}

function getHeight(elem) {
  let value = elem.offsetHeight;
  let margins = ['marginTop', 'marginBottom'];

  return (
    value +
    parseInt(style(elem, margins[0]), 10) +
    parseInt(style(elem, margins[1]), 10)
  );
}

const collapseStyles = {
  [EXITED]: styles.collapse,
  [EXITING]: styles.collapsing,
  [ENTERING]: styles.collapsing,
  [ENTERED]: `${styles.collapse} ${styles.in}`,
};

export class Collapse extends React.Component {
  nodeRef = React.createRef();

  /* -- Expanding -- */
  handleEnter = () => {
    this.nodeRef.current.style.height = '0';
  };

  handleEntering = () => {
    this.nodeRef.current.style.height = `${this.nodeRef.current.scrollHeight}px`;
  };

  handleEntered = () => {
    this.nodeRef.current.style.height = null;
  };

  /* -- Collapsing -- */
  handleExit = () => {
    this.nodeRef.current.style.height = getHeight(this.nodeRef.current) + 'px';
    this.nodeRef.current.offsetHeight; // eslint-disable-line no-unused-expressions
  };

  handleExiting = () => {
    this.nodeRef.current.style.height = '0';
  };

  render() {
    const { children, ...rest } = this.props;
    return (
      <Transition
        {...rest}
        nodeRef={this.nodeRef}
        timeout={350}
        onEnter={this.handleEnter}
        onEntering={this.handleEntering}
        onEntered={this.handleEntered}
        onExit={this.handleExit}
        onExiting={this.handleExiting}
      >
        {(state, props) => (
          <div ref={this.nodeRef} className={collapseStyles[state]} {...props}>
            {children}
          </div>
        )}
      </Transition>
    );
  }
}

export function FadeInnerRef(props) {
  const nodeRef = useMergedRef(props.innerRef);
  return (
    <Transition
      {...props}
      nodeRef={nodeRef}
      className={styles.fade}
      timeout={150}
    >
      {(status) => (
        <div
          ref={nodeRef}
          className={`${styles.fade} ${fadeStyles[status] || ''}`}
        >
          {props.children}
        </div>
      )}
    </Transition>
  );
}

export const FadeForwardRef = React.forwardRef((props, ref) => {
  return <FadeInnerRef {...props} innerRef={ref} />;
});

/**
 * Compose multiple refs, there may be different implementations
 * This one is derived from
 * e.g. https://github.com/react-restart/hooks/blob/ed37bf3dfc8fc1d9234a6d8fe0af94d69fad3b74/src/useMergedRefs.ts
 * Also here are good discussion about this
 * https://github.com/facebook/react/issues/13029
 * @param ref
 * @returns {React.MutableRefObject<undefined>}
 */
function useMergedRef(ref) {
  const nodeRef = React.useRef();
  useEffect(function () {
    if (ref) {
      if (typeof ref === 'function') {
        ref(nodeRef.current);
      } else {
        ref.current = nodeRef.current;
      }
    }
  });
  return nodeRef;
}
