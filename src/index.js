import CSSTransition from './CSSTransition';
import ReplaceTransition from './ReplaceTransition';
import TransitionGroup from './TransitionGroup';
import Transition from './Transition';
import { SwitchTransition, modes } from './SwitchTransition'

module.exports = {
  Transition,
  TransitionGroup,
  ReplaceTransition,
  CSSTransition,
  SwitchTransition,
  switchTransitionModes: modes
};
