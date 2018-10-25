import * as PropTypes from 'prop-types'
import React from 'react'
import mapContextToProps from 'react-context-toolbox/lib/mapContextToProps'

const { Provider, Consumer } = React.createContext(null)

export const transitionGroupContextPropType = PropTypes.shape({
  isMounting: PropTypes.bool.isRequired
})

export function withTransitionGroup(ComponentToWrap) {
  return mapContextToProps(Consumer, value => ({ transitionGroup: value }), ComponentToWrap)
}

export { Provider }
