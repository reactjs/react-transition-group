import { Children, cloneElement, isValidElement } from 'react'

/**
 * Given `this.props.children`, return an object mapping key to child.
 *
 * @param {*} children `this.props.children`
 * @return {object} Mapping of key to child
 */
export function getChildMapping(children, mapFn) {
  let mapper = child => (mapFn && isValidElement(child) ? mapFn(child) : child)

  let result = Object.create(null)
  if (children)
    Children.map(children, c => c).forEach(child => {
      // run the map function here instead so that the key is the computed one
      result[child.key] = mapper(child)
    })
  return result
}

/**
 * Given `this.props.children`, return an object mapping key to child's appendOnReplace prop.
 *
 * @param {*} children `this.props.children`
 * @return {object} Mapping of key to placement hint
 */
function getChildHintMapping(children) {
  let result = Object.create(null)
  if (children)
    Children.map(children, c => c).forEach(child => {
      // run the map function here instead so that the key is the computed one
      if (isValidElement(child)) result[child.key] = child.props && child.props.appendOnReplace
    })
  return result
}

/**
 * When you're adding or removing children some may be added or removed in the
 * same render pass. We want to show *both* since we want to simultaneously
 * animate elements in and out. This function takes a previous set of keys
 * and a new set of keys and merges them with its best guess of the correct
 * ordering. In the future we may expose some of the utilities in
 * ReactMultiChild to make this easy, but for now React itself does not
 * directly have this concept of the union of prevChildren and nextChildren
 * so we implement it here.
 *
 * @param {object} prev prev children as returned from
 * `ReactTransitionChildMapping.getChildMapping()`.
 * @param {object} next next children as returned from
 * `ReactTransitionChildMapping.getChildMapping()`.
 * @param {object} appendHints placement hint mapping as returned from getChildHintMapping().
 * @return {object} a key set that contains all keys in `prev` and all keys
 * in `next` in a reasonable order.
 */
export function mergeChildMappings(prev, next, appendHints) {
  prev = prev || {}
  next = next || {}
  appendHints = appendHints || {}

  function getValueForKey(key) {
    return key in next ? next[key] : prev[key]
  }

  // For each key of `next`, the list of keys to insert before that key in
  // the combined list
  let nextKeysPending = Object.create(null)

  let pendingKeys = []
  for (let prevKey in prev) {
    if (prevKey in next) {
      if (pendingKeys.length) {
        nextKeysPending[prevKey] = pendingKeys
        pendingKeys = []
      }
    } else {
      pendingKeys.push(prevKey)
    }
  }

  let pendingNewKeys = []
  let prependKeys = []
  let appendKeys = []
  let childMapping = {}
  let i
  for (let nextKey in next) {
    if (nextKey in prev) {
      if (nextKeysPending[nextKey]) {
        prependKeys = []
        appendKeys = []
        if (pendingNewKeys.length) {
          // If there were pending new keys that replaced the nextKeysPending,
          // place them before or after the prevKeys based on the value of their appendOnReplace prop
          for (i = 0; i < pendingNewKeys.length; i++) {
            if (!appendHints[pendingNewKeys[i]]) {
              prependKeys.push(pendingNewKeys[i])
            } else {
              appendKeys.push(pendingNewKeys[i])
            }
          }
          pendingNewKeys = []
        }
        const combinedPendingKeys = prependKeys.concat(nextKeysPending[nextKey]).concat(appendKeys)
        for (i = 0; i < combinedPendingKeys.length; i++) {
          let pendingNextKey = combinedPendingKeys[i]
          childMapping[pendingNextKey] = getValueForKey(
              pendingNextKey
          )
        }
      } else if (pendingNewKeys.length) {
        // If there were no pending prevKeys, place the pendingNewKeys before nextKey
        for (i = 0; i < pendingNewKeys.length; i++) {
          childMapping[pendingNewKeys[i]] = getValueForKey(pendingNewKeys[i])
        }
        pendingNewKeys = []
      }
      childMapping[nextKey] = getValueForKey(nextKey)
    } else {
      // If the key is new, wait to see if they go before or after any pending keys
      pendingNewKeys.push(nextKey)
    }
  }

  // For the remaining pending and new keys that didn't appear before any keys in next,
  // place the new keys before or after the pending keys based on the value of their appendOnReplace prop
  prependKeys = []
  appendKeys = []
  const finalAppendKeys = []
  for (i = 0; i < pendingNewKeys.length; i++) {
    if (!appendHints[pendingNewKeys[i]]) {
      prependKeys.push(pendingNewKeys[i])
    } else {
      appendKeys.push(pendingNewKeys[i])
    }
  }

  const finalPendingKeys = prependKeys.concat(pendingKeys).concat(appendKeys)

  // Finally, add the remaining keys
  for (i = 0; i < finalPendingKeys.length; i++) {
    childMapping[finalPendingKeys[i]] = getValueForKey(finalPendingKeys[i])
  }

  return childMapping
}

function getProp(child, prop, props) {
  return props[prop] != null ? props[prop] : child.props[prop]
}

export function getInitialChildMapping(props, onExited) {
  return getChildMapping(props.children, child => {
    return cloneElement(child, {
      onExited: onExited.bind(null, child),
      in: true,
      appear: getProp(child, 'appear', props),
      enter: getProp(child, 'enter', props),
      exit: getProp(child, 'exit', props),
    })
  })
}

export function getNextChildMapping(nextProps, prevChildMapping, onExited) {
  let nextChildMapping = getChildMapping(nextProps.children)
  let nextChildHintMapping = getChildHintMapping(nextProps.children)
  let children = mergeChildMappings(prevChildMapping, nextChildMapping, nextChildHintMapping)

  Object.keys(children).forEach(key => {
    let child = children[key]

    if (!isValidElement(child)) return

    const hasPrev = key in prevChildMapping
    const hasNext = key in nextChildMapping

    const prevChild = prevChildMapping[key]
    const isLeaving = isValidElement(prevChild) && !prevChild.props.in

    // item is new (entering)
    if (hasNext && (!hasPrev || isLeaving)) {
      // console.log('entering', key)
      children[key] = cloneElement(child, {
        onExited: onExited.bind(null, child),
        in: true,
        exit: getProp(child, 'exit', nextProps),
        enter: getProp(child, 'enter', nextProps),
      })
    } else if (!hasNext && hasPrev && !isLeaving) {
      // item is old (exiting)
      // console.log('leaving', key)
      children[key] = cloneElement(child, { in: false })
    } else if (hasNext && hasPrev && isValidElement(prevChild)) {
      // item hasn't changed transition states
      // copy over the last transition props;
      // console.log('unchanged', key)
      children[key] = cloneElement(child, {
        onExited: onExited.bind(null, child),
        in: prevChild.props.in,
        exit: getProp(child, 'exit', nextProps),
        enter: getProp(child, 'enter', nextProps),
      })
    }
  })

  return children
}
