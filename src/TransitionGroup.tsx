import PropTypes from 'prop-types';
import React from 'react';
import type { ReactElement, ReactChild } from 'react';
import TransitionGroupContext from './TransitionGroupContext';

import {
  getChildMapping,
  getInitialChildMapping,
  getNextChildMapping,
} from './utils/ChildMapping';

const values =
  Object.values ||
  ((obj: Record<string, unknown>) => Object.keys(obj).map((k) => obj[k]));

const defaultProps = {
  component: 'div',
  childFactory: (child: ReactElement) => child,
};

type Props = {
  component: any;
  children: any;
  appear: boolean;
  enter: boolean;
  exit: boolean;
  childFactory: (child: ReactElement) => ReactElement;
};

type State = {
  children: Record<string, ReactChild>;
  contextValue: { isMounting: boolean };
  handleExited: (
    child: ReactElement<{ onExited: (node: HTMLElement) => void }>,
    node: HTMLElement
  ) => void;
  firstRender: boolean;
};

/**
 * The `<TransitionGroup>` component manages a set of transition components
 * (`<Transition>` and `<CSSTransition>`) in a list. Like with the transition
 * components, `<TransitionGroup>` is a state machine for managing the mounting
 * and unmounting of components over time.
 *
 * Consider the example below. As items are removed or added to the TodoList the
 * `in` prop is toggled automatically by the `<TransitionGroup>`.
 *
 * Note that `<TransitionGroup>`  does not define any animation behavior!
 * Exactly _how_ a list item animates is up to the individual transition
 * component. This means you can mix and match animations across different list
 * items.
 */
class TransitionGroup extends React.Component<Props, State> {
  static defaultProps = defaultProps;

  mounted = false;
  constructor(props: Props, context: any) {
    super(props, context);

    const handleExited = this.handleExited.bind(this);

    // Initial children should all be entering, dependent on appear
    // @ts-expect-error FIXME: Property 'children' is missing in type '{ contextValue: { isMounting: true; }; handleExited: (child: React.ReactElement<{ onExited: (node: HTMLElement) => void; }, string | React.JSXElementConstructor<any>>, node: HTMLElement) => void; firstRender: true; }' but required in type 'Readonly<State>'.ts(2741)
    this.state = {
      contextValue: { isMounting: true },
      handleExited,
      firstRender: true,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.setState({
      contextValue: { isMounting: false },
    });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  static getDerivedStateFromProps(
    nextProps: Props,
    { children: prevChildMapping, handleExited, firstRender }: State
  ) {
    return {
      children: firstRender
        ? getInitialChildMapping(nextProps, handleExited)
        : getNextChildMapping(nextProps, prevChildMapping, handleExited),
      firstRender: false,
    };
  }

  // node is `undefined` when user provided `nodeRef` prop
  handleExited(
    child: ReactElement<{ onExited: (node: HTMLElement) => void }>,
    node: HTMLElement
  ) {
    let currentChildMapping = getChildMapping(this.props.children);
    if (child.key && child.key in currentChildMapping) return;

    if (child.props.onExited) {
      child.props.onExited(node);
    }

    if (this.mounted) {
      this.setState((state) => {
        let children = { ...state.children };
        if (child.key) {
          delete children[child.key];
        }
        return { children };
      });
    }
  }

  render() {
    const { component: Component, childFactory, ...props } = this.props;
    const { contextValue } = this.state;
    // @ts-expect-error FIXME: Type 'undefined' is not assignable to type 'ReactElement<any, string | JSXElementConstructor<any>>'.ts(2345)
    const children = values(this.state.children).map(childFactory);
    const {
      appear: _appear,
      enter: _enter,
      exit: _exit,
      ...delegatingProps
    } = props;

    if (Component === null) {
      return (
        <TransitionGroupContext.Provider value={contextValue}>
          {children}
        </TransitionGroupContext.Provider>
      );
    }
    return (
      <TransitionGroupContext.Provider value={contextValue}>
        <Component {...delegatingProps}>{children}</Component>
      </TransitionGroupContext.Provider>
    );
  }
}

// @ts-expect-error To make TS migration diffs minimum, I've left propTypes here instead of defining a static property
TransitionGroup.propTypes = {
  /**
   * `<TransitionGroup>` renders a `<div>` by default. You can change this
   * behavior by providing a `component` prop.
   * If you use React v16+ and would like to avoid a wrapping `<div>` element
   * you can pass in `component={null}`. This is useful if the wrapping div
   * borks your css styles.
   */
  component: PropTypes.any,
  /**
   * A set of `<Transition>` components, that are toggled `in` and out as they
   * leave. the `<TransitionGroup>` will inject specific transition props, so
   * remember to spread them through if you are wrapping the `<Transition>` as
   * with our `<Fade>` example.
   *
   * While this component is meant for multiple `Transition` or `CSSTransition`
   * children, sometimes you may want to have a single transition child with
   * content that you want to be transitioned out and in when you change it
   * (e.g. routes, images etc.) In that case you can change the `key` prop of
   * the transition child as you change its content, this will cause
   * `TransitionGroup` to transition the child out and back in.
   */
  children: PropTypes.node,

  /**
   * A convenience prop that enables or disables appear animations
   * for all children. Note that specifying this will override any defaults set
   * on individual children Transitions.
   */
  appear: PropTypes.bool,
  /**
   * A convenience prop that enables or disables enter animations
   * for all children. Note that specifying this will override any defaults set
   * on individual children Transitions.
   */
  enter: PropTypes.bool,
  /**
   * A convenience prop that enables or disables exit animations
   * for all children. Note that specifying this will override any defaults set
   * on individual children Transitions.
   */
  exit: PropTypes.bool,

  /**
   * You may need to apply reactive updates to a child as it is exiting.
   * This is generally done by using `cloneElement` however in the case of an exiting
   * child the element has already been removed and not accessible to the consumer.
   *
   * If you do need to update a child as it leaves you can provide a `childFactory`
   * to wrap every child, even the ones that are leaving.
   *
   * @type Function(child: ReactElement) -> ReactElement
   */
  childFactory: PropTypes.func,
};

export default TransitionGroup;
