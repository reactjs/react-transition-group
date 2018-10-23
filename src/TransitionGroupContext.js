import * as PropTypes from 'prop-types'
import React from 'react'

const TransitionGroupContext = React.createContext && React.createContext(null)

export const transitionGroupContextPropType = PropTypes.shape({
  isMounting: PropTypes.bool.isRequired
})

const Consumer = (TransitionGroupContext && TransitionGroupContext.Consumer) || class Consumer extends React.Component {
  static contextTypes = {
    transitionGroup: PropTypes.object,
  }
  render() {
    return this.props.children(this.context.transitionGroup)
  }
}

const Provider = (TransitionGroupContext && TransitionGroupContext.Provider) || class Provider extends React.Component {
  static childContextTypes = {
    transitionGroup: transitionGroupContextPropType,
  }
  static propTypes = {
    value: transitionGroupContextPropType
  }
  getChildContext() {
    return { transitionGroup: this.props.value }
  }
  render() { return this.props.children }
}

export function withTransitionGroup(ComponentToWrap) {
  return class WithTransitionGroup extends React.Component {
    static displayName = `withTransitionGroup(${ComponentToWrap.displayName || ComponentToWrap.name})`
    static __TestingStatefulComponent = ComponentToWrap
    render() {
      const { __testingRef, ...restProps } = this.props
      return (
        <Consumer>
          {transitionGroup => <ComponentToWrap ref={__testingRef} {...restProps} transitionGroup={transitionGroup} />}
        </Consumer>
      )
    }
  }
}

export { Provider }
