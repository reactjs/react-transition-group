import fastdom from 'fastdom';
import addOneClass from 'dom-helpers/class/addClass';
import removeOneClass from 'dom-helpers/class/removeClass';

export function addClass(node, classes) {
  mutateClass(node, classes, addOneClass);
}
export function removeClass(node, classes) {
  mutateClass(node, classes, removeOneClass);
}

function mutateClass(node, classes, fn) {
  if (!node) return;
  if (classes && typeof classes === 'string') {
    const run = () => {
      // A reflow is necessary to get the browser to respect the transition. However, it doesn't
      // need to be done on every single class change, only when the 'active' class is added.
      if (classes.indexOf('active') !== -1) {
        forceReflow(node);
      }
      classes.split(' ').forEach(c => fn(node, c));
    }
    // If possible, on browsers, batch these mutations as to avoid synchronous layouts.
    // But watch out - if we are batching them, and the page is inactive, we can end up
    // hitching up the page for a very long time as these callbacks queue up on
    // requestAnimationFrame. So only queue them up if the page is visible.
    if (process.browser && document.hidden === false) {
      fastdom.mutate(run);
    } else {
      run();
    }
  }
}

// This is for to force a repaint,
// which is necessary in order to transition styles when adding a class name.
function forceReflow(node) {
  /* eslint-disable no-unused-expressions */
  node && node.scrollTop;
}
