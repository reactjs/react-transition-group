import fastdom from 'fastdom';
import addOneClass from 'dom-helpers/class/addClass';
import removeOneClass from 'dom-helpers/class/removeClass';

export function addClass(node, classes, immediate = false) {
  mutateClass(node, classes, addOneClass, immediate);
}
export function removeClass(node, classes, immediate = false) {
  mutateClass(node, classes, removeOneClass, immediate);
}

function mutateClass(node, classes, fn, immediate) {
  if (!node) return;
  if (classes && typeof classes === 'string') {
    console.log(classes);
    const run = () => classes.split(' ').forEach(c => fn(node, c));
    // If possible, on browsers, batch these mutations as to avoid synchronous layouts.
    // But watch out - if we are batching them, and the page is inactive, we can end up
    // hitching up the page for a very long time as these callbacks queue up on
    // requestAnimationFrame. So only queue them up if the page is visible.
    if (process.browser && document.hidden === false && !immediate) {
      fastdom.mutate(run);
    } else {
      run();
    }
  }
}
