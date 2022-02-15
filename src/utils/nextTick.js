// polyfill for requestAnimationFrame
const rAF =
  typeof window !== 'undefined' &&
  typeof window.requestAnimationFrame === 'function'
    ? window.requestAnimationFrame
    : (cb) => setTimeout(cb, 1);

// https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
// Note: Your callback routine must itself call requestAnimationFrame() again
// if you want to animate another frame at the next repaint. requestAnimationFrame() is 1 shot.
export const nextTick = (cb) => rAF(() => rAF(cb));
