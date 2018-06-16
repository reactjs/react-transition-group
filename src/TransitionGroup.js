import chain from 'chain-function';
import React from 'react';
import PropTypes from 'prop-types';
import warning from 'warning';
import { polyfill } from 'react-lifecycles-compat';

import { getChildMapping, mergeChildMappings } from './utils/ChildMapping';


const propTypes = {
  component: PropTypes.any,
  childFactory: PropTypes.func,
  children: PropTypes.node,
};

const defaultProps = {
  component: 'span',
  childFactory: child => child,
};


class TransitionGroup extends React.Component {
  static displayName = 'TransitionGroup';

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
        this.performAppear(key, this.childRefs[key]);
      }
    }
  }

  static getDerivedStateFromProps(props, state) {
    let nextChildMapping = getChildMapping(props.children);
    let prevChildMapping = state.children;

    return {
      children: mergeChildMappings(
        prevChildMapping,
        nextChildMapping,
      ),
    };
  }

  componentDidUpdate(prevProps, prevState) {
    let nextChildMapping = getChildMapping(this.props.children);
    let prevChildMapping = prevState.children;

    for (let key in nextChildMapping) {
      let hasPrev = prevChildMapping && prevChildMapping.hasOwnProperty(key);
      if (nextChildMapping[key] && !hasPrev &&
        !this.currentlyTransitioningKeys[key]) {
        this.keysToEnter.push(key);
      }
    }

    for (let key in prevChildMapping) {
      let hasNext = nextChildMapping && nextChildMapping.hasOwnProperty(key);
      if (prevChildMapping[key] && !hasNext &&
        !this.currentlyTransitioningKeys[key]) {
        this.keysToLeave.push(key);
      }
    }

    // If we want to someday check for reordering, we could do it here.

    let keysToEnter = this.keysToEnter;
    this.keysToEnter = [];
    keysToEnter.forEach(key => this.performEnter(key, this.childRefs[key]));

    let keysToLeave = this.keysToLeave;
    this.keysToLeave = [];
    keysToLeave.forEach(key => this.performLeave(key, this.childRefs[key]));
  }

  performAppear = (key, component) => {
    this.currentlyTransitioningKeys[key] = true;

    if (component.componentWillAppear) {
      component.componentWillAppear(
        this._handleDoneAppearing.bind(this, key, component),
      );
    } else {
      this._handleDoneAppearing(key, component);
    }
  };

  _handleDoneAppearing = (key, component) => {
    if (component && component.componentDidAppear) {
      component.componentDidAppear();
    }

    delete this.currentlyTransitioningKeys[key];

    let currentChildMapping = getChildMapping(this.props.children);

    if (!currentChildMapping || !currentChildMapping.hasOwnProperty(key)) {
      // This was removed before it had fully appeared. Remove it.
      this.performLeave(key, component);
    }
  };

  performEnter = (key, component) => {
    this.currentlyTransitioningKeys[key] = true;

    if (component.componentWillEnter) {
      component.componentWillEnter(
        this._handleDoneEntering.bind(this, key, component),
      );
    } else {
      this._handleDoneEntering(key, component);
    }
  };

  _handleDoneEntering = (key, component) => {
    if (component && component.componentDidEnter) {
      component.componentDidEnter();
    }

    delete this.currentlyTransitioningKeys[key];

    let currentChildMapping = getChildMapping(this.props.children);

    if (!currentChildMapping || !currentChildMapping.hasOwnProperty(key)) {
      // This was removed before it had fully entered. Remove it.
      this.performLeave(key, component);
    }
  };

  performLeave = (key, component) => {
    this.currentlyTransitioningKeys[key] = true;

    if (component && component.componentWillLeave) {
      component.componentWillLeave(this._handleDoneLeaving.bind(this, key, component));
    } else {
      // Note that this is somewhat dangerous b/c it calls setState()
      // again, effectively mutating the component before all the work
      // is done.
      this._handleDoneLeaving(key, component);
    }
  };

  _handleDoneLeaving = (key, component) => {
    if (component && component.componentDidLeave) {
      component.componentDidLeave();
    }

    delete this.currentlyTransitioningKeys[key];

    let currentChildMapping = getChildMapping(this.props.children);

    if (currentChildMapping && currentChildMapping.hasOwnProperty(key)) {
      // This entered again before it fully left. Add it again.
      this.keysToEnter.push(key);
    } else {
      this.setState((state) => {
        let newChildren = Object.assign({}, state.children);
        delete newChildren[key];
        return { children: newChildren };
      });
    }
  };

  render() {
    // TODO: we could get rid of the need for the wrapper node
    // by cloning a single child
    let childrenToRender = [];
    for (let key in this.state.children) {
      let child = this.state.children[key];
      if (child) {
        let isCallbackRef = typeof child.ref !== 'string';
        let factoryChild = this.props.childFactory(child);
        let ref = (r) => {
          this.childRefs[key] = r;
        };

        warning(isCallbackRef,
          'string refs are not supported on children of TransitionGroup and will be ignored. ' +
          'Please use a callback ref instead: https://facebook.github.io/react/docs/refs-and-the-dom.html#the-ref-callback-attribute');

        // Always chaining the refs leads to problems when the childFactory
        // wraps the child. The child ref callback gets called twice with the
        // wrapper and the child. So we only need to chain the ref if the
        // factoryChild is not different from child.
        if (factoryChild === child && isCallbackRef) {
          ref = chain(child.ref, ref);
        }

        // You may need to apply reactive updates to a child as it is leaving.
        // The normal React way to do it won't work since the child will have
        // already been removed. In case you need this behavior you can provide
        // a childFactory function to wrap every child, even the ones that are
        // leaving.
        childrenToRender.push(React.cloneElement(
          factoryChild,
          {
            key,
            ref,
          },
        ));
      }
    }

    // Do not forward TransitionGroup props to primitive DOM nodes
    let props = Object.assign({}, this.props);
    delete props.transitionLeave;
    delete props.transitionName;
    delete props.transitionAppear;
    delete props.transitionEnter;
    delete props.childFactory;
    delete props.transitionLeaveTimeout;
    delete props.transitionEnterTimeout;
    delete props.transitionAppearTimeout;
    delete props.component;

    return React.createElement(
      this.props.component,
      props,
      childrenToRender,
    );
  }
}

TransitionGroup.propTypes = propTypes;
TransitionGroup.defaultProps = defaultProps;

export default polyfill(TransitionGroup);
