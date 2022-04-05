import PropTypes from 'prop-types';
import React from 'react';
import type { ReactElement } from 'react';
import ReactDOM from 'react-dom';
import TransitionGroup from './TransitionGroup';
import type { Props as TransitionProps } from './Transition';

type Props = Omit<TransitionProps, 'children'> & {
  children: [ReactElement<TransitionProps>, ReactElement<TransitionProps>];
};

type LifecycleMethodNames =
  | 'onEnter'
  | 'onEntering'
  | 'onEntered'
  | 'onExit'
  | 'onExiting'
  | 'onExited';

type HandlerArgs = [HTMLElement | boolean, boolean | undefined];
type ChildElement = ReactElement<TransitionProps>;
type ReplaceElements = [ChildElement, ChildElement];

/**
 * The `<ReplaceTransition>` component is a specialized `Transition` component
 * that animates between two children.
 *
 * ```jsx
 * <ReplaceTransition in>
 *   <Fade><div>I appear first</div></Fade>
 *   <Fade><div>I replace the above</div></Fade>
 * </ReplaceTransition>
 * ```
 */
class ReplaceTransition extends React.Component<Props> {
  handleEnter = (...args: HandlerArgs) =>
    this.handleLifecycle('onEnter', 0, args);
  handleEntering = (...args: HandlerArgs) =>
    this.handleLifecycle('onEntering', 0, args);
  handleEntered = (...args: HandlerArgs) =>
    this.handleLifecycle('onEntered', 0, args);

  handleExit = (...args: HandlerArgs) =>
    this.handleLifecycle('onExit', 1, args);
  handleExiting = (...args: HandlerArgs) =>
    this.handleLifecycle('onExiting', 1, args);
  handleExited = (...args: HandlerArgs) =>
    this.handleLifecycle('onExited', 1, args);

  handleLifecycle(
    handler: LifecycleMethodNames,
    idx: number,
    originalArgs: HandlerArgs
  ) {
    const { children } = this.props;
    // @ts-expect-error FIXME: Type 'string' is not assignable to type 'ReactElement<Props, string | JSXElementConstructor<any>>'.ts(2322)
    const child: ChildElement = React.Children.toArray(children)[idx];

    // @ts-expect-error FIXME: Type 'false' is not assignable to type '(((boolean | HTMLElement) & (HTMLElement | undefined)) & (HTMLElement | undefined)) & (HTMLElement | undefined)'.ts(2345)
    if (child.props[handler]) child.props[handler](...originalArgs);
    if (this.props[handler]) {
      const maybeNode = child.props.nodeRef
        ? undefined
        : ReactDOM.findDOMNode(this);
      // @ts-expect-error FIXME: Argument of type 'Element | Text | null | undefined' is not assignable to parameter of type 'HTMLElement'.ts(2769)
      this.props[handler](maybeNode);
    }
  }

  render() {
    const {
      children,
      in: inProp,
      onEnter: _onEnter,
      onEntering: _onEntering,
      onEntered: _onEntered,
      onExit: _onExit,
      onExiting: _onExiting,
      onExited: _onExited,
      ...props
    } = this.props;
    // @ts-expect-error FIXME: Target requires 2 element(s) but source may have fewer.ts(2322)
    const [first, second]: ReplaceElements = React.Children.toArray(children);

    return (
      <TransitionGroup {...props}>
        {inProp
          ? React.cloneElement(first, {
              key: 'first',
              onEnter: this.handleEnter,
              onEntering: this.handleEntering,
              onEntered: this.handleEntered,
            })
          : React.cloneElement(second, {
              key: 'second',
              onEnter: this.handleExit,
              onEntering: this.handleExiting,
              onEntered: this.handleExited,
            })}
      </TransitionGroup>
    );
  }
}

// @ts-expect-error To make TS migration diffs minimum, I've left propTypes here instead of defining a static property
ReplaceTransition.propTypes = {
  in: PropTypes.bool.isRequired,
  children(props: any, propName: LifecycleMethodNames) {
    if (React.Children.count(props[propName]) !== 2)
      return new Error(
        `"${propName}" must be exactly two transition components.`
      );

    return null;
  },
};

export default ReplaceTransition;
