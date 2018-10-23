import React from 'react'
import createReactContext from 'create-react-context'

const { Provider, Consumer } = createReactContext(null)

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
