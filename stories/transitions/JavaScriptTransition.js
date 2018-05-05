import React from 'react'
import anime from 'animejs'
import Transition from '../../src/Transition'

const styles = css`
  .box {
    width: 5rem;
    height: 5rem;
    background-color: #ec515c;
  }

  .container {
    padding: 1rem;
  }
`

let currentAnimation
const cancelCurrentAnimation = () => currentAnimation && currentAnimation.pause()

const animateBoxIn = (box, appearing, complete) => {
  cancelCurrentAnimation()
  const duration = 500 + Math.floor(Math.random() * 1000)
  currentAnimation = anime({
    targets: box,
    translateX: [-100, 0],
    opacity: {
      value: [0, 1],
      easing: 'linear'
    },
    rotate: '1turn',
    complete,
    duration
  })
}

const animateBoxOut = (box, complete) => {
  cancelCurrentAnimation()
  const duration = 500 + Math.floor(Math.random() * 1000)
  currentAnimation = anime({
    targets: box,
    translateX: [0, 100],
    opacity: {
      value: 0,
      easing: 'linear'
    },
    rotate: '2turn',
    complete,
    duration
  })
}

const onEntered = () => console.log('entered')
const onExited = () => console.log('exited')

function JavascriptTransition({ in: visible }) {
  return (
    <div className={styles.container}>
      <Transition
        in={visible}
        unmountOnExit
        onEntering={animateBoxIn}
        onExiting={animateBoxOut}
        onEntered={onEntered}
        onExited={onExited}
      >
        <div className={styles.box} />
      </Transition>
    </div>
  )
}

export default JavascriptTransition
