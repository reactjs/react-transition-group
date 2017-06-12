import PropTypes from 'prop-types';
import React, { cloneElement, isValidElement } from 'react';

import { getChildMapping, mergeChildMappings } from './utils/ChildMapping';

const values = Object.values || (obj => Object.keys(obj).map(k => obj[k]));

const propTypes = {
  component: PropTypes.any,
  children: PropTypes.node,
  appear: PropTypes.bool,
  enter: PropTypes.bool,
  exit: PropTypes.bool,
};

const defaultProps = {
  component: 'span',
};

class TransitionGroup extends React.Component {
  static displayName = 'TransitionGroup';
  static childContextTypes = {
    transitionGroup: PropTypes.object.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    // Initial children should all be entering, dependent on appear
    this.state = {
      children: getChildMapping(props.children, child => {
        const onExited = () => this.handleExited(child.key);
        return cloneElement(child, {
          onExited,
          in: true,
          appear: this.getProp(child, 'appear'),
          enter: this.getProp(child, 'enter'),
          exit: this.getProp(child, 'exit'),
        })
      }),
     };
  }

  getChildContext() {
    return {
       transitionGroup: { isMounting: !this.appeared }
    }
  }
  // use child config unless explictly set by the Group
  getProp(child, prop, props = this.props) {
    return props[prop] != null ?
      props[prop] :
      child.props[prop];
  }

  componentDidMount() {
    this.appeared = true;
  }

  componentWillReceiveProps(nextProps) {
    let prevChildMapping = this.state.children;
    let nextChildMapping = getChildMapping(nextProps.children);

    let children = mergeChildMappings(prevChildMapping, nextChildMapping);

    Object.keys(children).forEach((key) => {
      let child = children[key]

      if (!isValidElement(child)) return;

      const onExited = () => this.handleExited(key);

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
          exit: this.getProp(child, 'exit', nextProps),
          enter: this.getProp(child, 'enter', nextProps),
        });
      }
      // item is old (exiting)
      else if (!hasNext && hasPrev && !isLeaving) {
        // console.log('leaving', key)
        children[key] = cloneElement(child, { in: false });
      }
      // item hasn't changed transition states
      // copy over the last transition props;
      else if (hasNext && hasPrev && isValidElement(prevChild)) {
        // console.log('unchanged', key)
        children[key] = cloneElement(child, {
          onExited,
          in: prevChild.props.in,
          exit: this.getProp(child, 'exit', nextProps),
          enter: this.getProp(child, 'enter', nextProps),
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

  render() {
    const { component: Component, ...props } = this.props;
    const { children } = this.state;

    delete props.appear;
    delete props.enter;
    delete props.exit;

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
