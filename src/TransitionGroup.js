import chain from 'chain-function';
import React from 'react';
import PropTypes from 'prop-types';
import warning from 'warning';

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

    this.state = {
      children: getChildMapping(props.children),
    };
  }

  componentWillMount() {
    this.currentlyTransitioningKeys = {};
    this.keysToEnter = [];
    this.keysToLeave = [];
  }

  componentDidMount() {
    let initialChildMapping = this.state.children;
    for (let key in initialChildMapping) {
      if (initialChildMapping[key]) {
        this.performAppear(key);
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
  }

  componentDidUpdate() {
    let keysToEnter = this.keysToEnter;
    this.keysToEnter = [];
    keysToEnter.forEach(this.performEnter);

    let keysToLeave = this.keysToLeave;
    this.keysToLeave = [];
    keysToLeave.forEach(this.performLeave);
  }

  performAppear = (key) => {
    this.currentlyTransitioningKeys[key] = true;

    let component = this.childRefs[key];

    if (component.componentWillAppear) {
      component.componentWillAppear(
        this._handleDoneAppearing.bind(this, key),
      );
    } else {
      this._handleDoneAppearing(key);
    }
  };

  _handleDoneAppearing = (key) => {
    let component = this.childRefs[key];
    if (component && component.componentDidAppear) {
      component.componentDidAppear();
    }

    delete this.currentlyTransitioningKeys[key];

    let currentChildMapping = getChildMapping(this.props.children);

    if (!currentChildMapping || !currentChildMapping.hasOwnProperty(key)) {
      // This was removed before it had fully appeared. Remove it.
      this.performLeave(key);
    }
  };

  performEnter = (key) => {
    this.currentlyTransitioningKeys[key] = true;

    let component = this.childRefs[key];

    if (component.componentWillEnter) {
      component.componentWillEnter(
        this._handleDoneEntering.bind(this, key),
      );
    } else {
      this._handleDoneEntering(key);
    }
  };

  _handleDoneEntering = (key) => {
    let component = this.childRefs[key];
    if (component && component.componentDidEnter) {
      component.componentDidEnter();
    }

    delete this.currentlyTransitioningKeys[key];

    let currentChildMapping = getChildMapping(this.props.children);

    if (!currentChildMapping || !currentChildMapping.hasOwnProperty(key)) {
      // This was removed before it had fully entered. Remove it.
      this.performLeave(key);
    }
  };

  performLeave = (key) => {
    this.currentlyTransitioningKeys[key] = true;

    let component = this.childRefs[key];
    if (component.componentWillLeave) {
      component.componentWillLeave(this._handleDoneLeaving.bind(this, key));
    } else {
      // Note that this is somewhat dangerous b/c it calls setState()
      // again, effectively mutating the component before all the work
      // is done.
      this._handleDoneLeaving(key);
    }
  };

  _handleDoneLeaving = (key) => {
    let component = this.childRefs[key];

    if (component && component.componentDidLeave) {
      component.componentDidLeave();
    }

    delete this.currentlyTransitioningKeys[key];

    let currentChildMapping = getChildMapping(this.props.children);

    if (currentChildMapping && currentChildMapping.hasOwnProperty(key)) {
      // This entered again before it fully left. Add it again.
      this.performEnter(key);
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

export default TransitionGroup;
