import React from 'react';
import PropTypes from 'prop-types';

function areChildrenDifferent(oldChildren, newChildren) {
  if (oldChildren === newChildren) return false;
  if (
    React.isValidElement(oldChildren) &&
    React.isValidElement(newChildren) &&
    oldChildren.key != null &&
    oldChildren.key === newChildren.key
  ) {
    return false;
  }
  return true;
}

const ENTERED = 'ENTERED';
const ENTERING = 'ENTERING';
const EXITING = 'EXITING';

export const modes = {
  out: 'out-in',
  in: 'in-out'
};

const leaveRenders = {
  [modes.out]: ({ current, changeState }) =>
    React.cloneElement(current, {
      in: false,
      onExited: () => {
        changeState(ENTERING, null);
      }
    }),
  [modes.in]: ({ current, changeState, children }) => [
    current,
    React.cloneElement(children, {
      in: true,
      onEntered: () => {
        changeState(ENTERING);
      }
    })
  ]
};

const enterRenders = {
  [modes.out]: ({ children, changeState }) =>
    React.cloneElement(children, {
      in: true,
      onEntered: () => {
        changeState(ENTERED, React.cloneElement(children, { in: true }));
      }
    }),
  [modes.in]: ({ current, children, changeState }) => [
    React.cloneElement(current, {
      in: false,
      onExited: () => {
        changeState(ENTERED, React.cloneElement(children, { in: true }));
      }
    }),
    React.cloneElement(children, {
      in: true
    })
  ]
};

export class SwitchTransition extends React.Component {
  static childContextTypes = {
    transitionGroup: PropTypes.object.isRequired
  };

  getChildContext() {
    return {
      transitionGroup: { isMounting: !this.appeared }
    };
  }

  state = {
    status: ENTERED,
    current: null
  };

  appeared = false;

  componentDidMount() {
    this.appeared = true;
  }

  static getDerivedStateFromProps(props, state) {
    if (state.status === ENTERING && props.mode === modes.in) {
      return {
        status: state.status
      };
    }

    if (state.current && areChildrenDifferent(state.current, props.children)) {
      return {
        status: EXITING
      };
    }

    return {
      current: React.cloneElement(props.children, {
        in: true
      })
    };
  }

  changeState = (status, current = this.state.current) => {
    this.setState({
      status,
      current
    });
  };

  render() {
    const {
      props: { children, mode },
      state: { status, current }
    } = this;

    const data = { children, current, changeState: this.changeState, status };

    switch (status) {
      case ENTERING:
        return enterRenders[mode](data);
      case EXITING:
        return leaveRenders[mode](data);
      case ENTERED:
        return current;
    }
  }
}


SwitchTransition.propTypes = {
  mode: PropTypes.arrayOf([modes.in, modes.out]),
}
