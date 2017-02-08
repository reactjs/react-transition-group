import chain from 'chain-function';
import React from 'react';
import warning from 'warning';

import { getChildMapping, mergeChildMappings } from './utils/ChildMapping';

function notify(handler, args = []) {
  if (handler) handler(...args);
}

const propTypes = {
  component: React.PropTypes.any,
  childFactory: React.PropTypes.func,
  children: React.PropTypes.node,
};

const defaultProps = {
  component: 'span',
  childFactory: child => child,
};


class TransitionGroup extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.childRefs = Object.create(null);
    this.currentlyTransitioningKeys = {};
    this.keysToEnter = [];
    this.keysToLeave = [];

    this.state = {
      children: getChildMapping(props.children),
    };
  }

  componentDidMount() {
    let initialChildMapping = this.state.children;
    for (let key in initialChildMapping) {
      if (initialChildMapping[key]) {
        this.perform('Appear', key);
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    let nextChildMapping = getChildMapping(nextProps.children);
    let prevChildMapping = this.state.children;

    this.setState({
      children: mergeChildMappings(
        prevChildMapping,
        nextChildMapping,
      ),
    });

    for (let key in nextChildMapping) {
      let hasPrev = prevChildMapping && prevChildMapping.hasOwnProperty(key);
      if (
        nextChildMapping[key] &&
        !hasPrev &&
        !this.currentlyTransitioningKeys[key]
      ) {
        this.keysToEnter.push(key);
      }
    }

    for (let key in prevChildMapping) {
      let hasNext = nextChildMapping && nextChildMapping.hasOwnProperty(key);
      if (
        prevChildMapping[key] &&
        !hasNext &&
        !this.currentlyTransitioningKeys[key]
      ) {
        this.keysToLeave.push(key);
      }
    }

    // If we want to someday check for reordering, we could do it here.
  }

  componentDidUpdate() {
    let keysToEnter = this.keysToEnter;
    this.keysToEnter = [];
    keysToEnter.forEach(key => this.perform('Enter', key));

    let keysToLeave = this.keysToLeave;
    this.keysToLeave = [];
    keysToLeave.forEach(key => this.perform('Leave', key));
  }

  handleDoneAppear = (key) => {
    let component = this.childRefs[key];

    notify(component.componentDidAppear);

    delete this.currentlyTransitioningKeys[key];

    this.maybePerformLeave(key);
  };

  handleDoneEnter = (key) => {
    let component = this.childRefs[key];

    notify(component.componentDidEnter);

    delete this.currentlyTransitioningKeys[key];

    this.maybePerformLeave(key);
  };

  handleDoneLeave = (key) => {
    let component = this.childRefs[key];

    notify(component.componentDidLeave);

    delete this.currentlyTransitioningKeys[key];

    let currentChildMapping = getChildMapping(this.props.children);

    if (currentChildMapping && currentChildMapping.hasOwnProperty(key)) {
      // This entered again before it fully left. Add it again.
      this.perform('Enter', key);
    } else {
      this.setState(({ children }) => {
        let newChildren = Object.assign({}, children);
        delete newChildren[key];
        return { children: newChildren };
      });
    }
  };

  perform = (type, key) => {
    let component = this.childRefs[key];

    let finishHandler = () => this[`handleDone${type}`](key);
    let lifeCycle = component && component[`componentWill${type}`];

    this.currentlyTransitioningKeys[key] = true;

    if (lifeCycle) {
      lifeCycle.call(component, finishHandler);
    } else {
      // Note that this is somewhat dangerous b/c it calls setState()
      // again, effectively mutating the component before all the work
      // is done.
      finishHandler();
    }
  };

  maybePerformLeave = (key) => {
    let currentChildMapping = getChildMapping(this.props.children);

    if (!currentChildMapping || !currentChildMapping.hasOwnProperty(key)) {
      // This was removed before it had fully appeared. Remove it.
      this.perform('Leave', key);
    }
  }

  render() {
    const { children } = this.state;

    // TODO: we could get rid of the need for the wrapper node
    // by cloning a single child
    let childrenToRender = [];
    for (let key in children) {
      let child = children[key];

      if (!child) continue;

      let isCallbackRef = typeof child.ref !== 'string';
      warning(isCallbackRef,
        'string refs are not supported on children of TransitionGroup and will be ignored. ' +
        'Please use a callback ref instead: https://facebook.github.io/react/docs/refs-and-the-dom.html#the-ref-callback-attribute');

      // You may need to apply reactive updates to a child as it is leaving.
      // The normal React way to do it won't work since the child will have
      // already been removed. In case you need this behavior you can provide
      // a childFactory function to wrap every child, even the ones that are
      // leaving.
      childrenToRender.push(React.cloneElement(
        this.props.childFactory(child),
        {
          key,
          ref: chain(
            isCallbackRef ? child.ref : null,
            (r) => {
              this.childRefs[key] = r;
            }),
        },
      ));
    }

    // Do not forward TransitionGroup props to primitive DOM nodes
    let props = { ...this.props };

    delete props.childFactory;
    delete props.component;
    delete props.children;

    return React.createElement(
      this.props.component,
      props,
      childrenToRender,
    );
  }
}

TransitionGroup.propTypes = propTypes;
TransitionGroup.defaultProps = defaultProps;

export default TransitionGroup;
