import fastdom from 'fastdom';
import addOneClass from 'dom-helpers/class/addClass';
import removeOneClass from 'dom-helpers/class/removeClass';

export function addClass(node, classes, reflow) {
  mutateClass(node, classes, reflow, addOneClass);
}
export function removeClass(node, classes, reflow) {
  mutateClass(node, classes, reflow, removeOneClass);
}

function mutateClass(node, classes, reflow, fn) {
  if (!node) return;
  if (classes && typeof classes === 'string') {
    const run = () => {
      // A reflow is necessary to get the browser to respect the transition. However, it doesn't
      // need to be done on every single class change, only when the 'active' class is added.
      // Batching reflows allows us to avoid read-write-read context switches, by reading
      // (node.scrollTop) completely before we write.
      if (reflow) emptyReflow();
      classes.split(' ').forEach(c => fn(node, c));
    }
    // If possible, on browsers, batch these mutations as to avoid synchronous layouts.
    // But watch out - if we are batching them, and the page is inactive, we can end up
    // hitching up the page for a very long time as these callbacks queue up on
    // requestAnimationFrame. So only queue them up if the page is visible.
    if (process.browser && document.hidden === false) {
      // Is this an entering animation where we'll need to force a reflow?
      if (reflow) reflowNodes.push(node);
      // Schedule the modification for next tick.
      fastdom.mutate(run);
    } else {
      run();
    }
  }
}

const reflowNodes = [];
// Empty the `reflowNodes` array completely and reflow all of them at once.
function emptyReflow() {
  let node;
  while (node = reflowNodes.pop()) forceReflow(node);
}

// This is for to force a repaint,
// which is necessary in order to transition styles when adding a class name.
function forceReflow(node) {
  /* eslint-disable no-unused-expressions */
  node && node.scrollTop;
}
