import PropTypes from 'prop-types';
import React from 'react';
import type { ReactElement } from 'react';
import ReactDOM from 'react-dom';
import TransitionGroup from './TransitionGroup';
import type { Props as TransitionProps } from './Transition';

type Props = Omit<TransitionProps, 'children'> & {
  children: [ReactElement<TransitionProps>, ReactElement<TransitionProps>];
};

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
  handleEnter = (...args: any) => this.handleLifecycle('onEnter', 0, args);
  handleEntering = (...args: any) =>
    this.handleLifecycle('onEntering', 0, args);
  handleEntered = (...args: any) => this.handleLifecycle('onEntered', 0, args);

  handleExit = (...args: any) => this.handleLifecycle('onExit', 1, args);
  handleExiting = (...args: any) => this.handleLifecycle('onExiting', 1, args);
  handleExited = (...args: any) => this.handleLifecycle('onExited', 1, args);

  handleLifecycle(handler: any, idx: number, originalArgs: any) {
    const { children } = this.props;
    // @ts-expect-error FIXME: Type 'string' is not assignable to type 'ReactElement<Props, string | JSXElementConstructor<any>>'.ts(2322)
    const child: ChildElement = React.Children.toArray(children)[idx];

    if (child.props[handler]) child.props[handler](...originalArgs);
    // @ts-expect-error Element implicitly has an 'any' type because expression of type 'any' can't be used to index type 'Readonly<Props> & Readonly<{ children?: ReactNode; }>'.ts(7053)
    if (this.props[handler]) {
      const maybeNode = child.props.nodeRef
        ? undefined
        : ReactDOM.findDOMNode(this);
      // @ts-expect-error FIXME: Argument of type 'Element | Text | null | undefined' is not assignable to parameter of type 'HTMLElement'.ts(2769)
      this.props[handler](maybeNode);
    }
  }

  render() {
    const { children, in: inProp, ...props }: any = this.props;
    const [first, second]: any = React.Children.toArray(children);

    delete props.onEnter;
    delete props.onEntering;
    delete props.onEntered;
    delete props.onExit;
    delete props.onExiting;
    delete props.onExited;

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
  children(props: any, propName: any) {
    if (React.Children.count(props[propName]) !== 2)
      return new Error(
        `"${propName}" must be exactly two transition components.`
      );

    return null;
  },
};

export default ReplaceTransition;
