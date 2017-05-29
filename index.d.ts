import { ComponentClass, Props, ReactElement, ReactType } from 'react';

interface TransitionNameSimpleObject {
  enter?: string;
  leave?: string;
  active?: string;
}

interface TransitionNameFullObject extends TransitionNameSimpleObject {
  enterActive?: string;
  leaveActive?: string;
  activeActive?: string;
}

interface TransitionGroupPropsBase extends Props<any> {
  component?: ReactType;
}

interface TransitionGroupProps extends TransitionGroupPropsBase {
  childFactory?: (child: ReactElement<any>) => ReactElement<any>;
}

interface CSSTransitionGroupProps extends TransitionGroupPropsBase {
  transitionName: string | TransitionNameSimpleObject | TransitionNameFullObject;
  transitionAppear?: boolean;
  transitionEnter?: boolean;
  transitionLeave?: boolean;
  transitionAppearTimeout?: number;
  transitionEnterTimeout?: number;
  transitionLeaveTimeout?: number;
}

type TransitionGroup = ComponentClass<TransitionGroupProps>;
type CSSTransitionGroup = ComponentClass<CSSTransitionGroupProps>;

export const TransitionGroup: TransitionGroup;
export const CSSTransitionGroup: CSSTransitionGroup;
