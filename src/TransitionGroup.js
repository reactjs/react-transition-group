import PropTypes from 'prop-types';
import React, { cloneElement, isValidElement } from 'react';

import { getChildMapping, mergeChildMappings } from './utils/ChildMapping';
import { timeoutsShape } from './utils/PropTypes';

const values = Object.values || (obj => Object.keys(obj).map(k => obj[k]));

function normalizeTimeout(timeout) {
  if (typeof timeout === 'number') return timeout;
  // transitions are always "appearing" in the context of a TransitionGroup
  return { ...timeout, appear: timeout.enter }
}

const propTypes = {
  component: PropTypes.any,
  children: PropTypes.node,
  timeout: timeoutsShape,
};

const defaultProps = {
  component: 'span',
};

class TransitionGroup extends React.Component {
  static displayName = 'TransitionGroup';

  constructor(props, context) {
    super(props, context);

    // Initial children should all be entering, dependent on transitionAppear
    this.state = {
      children: getChildMapping(props.children, child => {
        const timeout = this.getTimeout(child);
        return cloneElement(child, {
          timeout,
          in: true,
          transitionAppear: timeout.appear != null,
          onExited: () => this.handleExited(child.key),
        })
      }),
     };
  }

  componentWillReceiveProps(nextProps) {
    let prevChildMapping = this.state.children;
    let nextChildMapping = getChildMapping(nextProps.children);

    let children = mergeChildMappings(prevChildMapping, nextChildMapping);

    Object.keys(children).forEach((key) => {
      let child = children[key]

      if (!isValidElement(child)) return;

      const onExited = () => this.handleExited(key);
      const timeout = this.getTimeout(child);

      const hasPrev = key in prevChildMapping;
      const hasNext = key in nextChildMapping;

      const prevChild = prevChildMapping[key];
      const isLeaving = isValidElement(prevChild) && !prevChild.props.in;

      // item is new (entering)
      if (hasNext && (!hasPrev || isLeaving)) {
        // console.log('entering', key)
        children[key] = cloneElement(child, {
          onExited,
          in: true,
          transitionAppear: true,
          timeout: normalizeTimeout(timeout)
        });
      }
      // item is old (exiting)
      else if (!hasNext && hasPrev && !isLeaving) {
        // console.log('leaving', key)
        children[key] = cloneElement(child, { in: false, timeout });
      }
      // item hasn't changed transition states
      // copy over the last transition props;
      else if (hasNext && hasPrev && isValidElement(prevChild)) {
        // console.log('unchanged', key)
        children[key] = cloneElement(child, {
          onExited,
          in: prevChild.props.in,
          transitionAppear: prevChild.props.transitionAppear,
        });
      }
    })

    this.setState({ children });
  }

  handleExited = (key) => {
    let currentChildMapping = getChildMapping(this.props.children);

    if (key in currentChildMapping) return

    this.setState((state) => {
      let children = { ...state.children };
      delete children[key];
      return { children };
    });
  };

  getTimeout(child) {
    const childTimeout = child && child.props.timeout;
    if (childTimeout != null) return childTimeout;
    return this.props.timeout;
  }

  render() {
    const { component: Component, timeout: _, ...props } = this.props;
    const { children } = this.state;

    return (
      <Component {...props}>
        {values(children)}
      </Component>
    );
  }
}

TransitionGroup.propTypes = propTypes;
TransitionGroup.defaultProps = defaultProps;

export default TransitionGroup;
