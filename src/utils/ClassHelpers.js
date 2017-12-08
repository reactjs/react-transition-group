import fastdom from 'fastdom';
import addOneClass from 'dom-helpers/class/addClass';
import removeOneClass from 'dom-helpers/class/removeClass';

export function addClass(node, classes) {
  mutateClass(node, classes, addOneClass);
}
export function removeClass(node, classes) {
  mutateClass(node, classes, removeOneClass);
}

let visibilityWatcher;

function mutateClass(node, classes, fn) {
  if (!node) return;
  if (classes && typeof classes === 'string') {
    const run = () => {
      classes.split(' ').forEach(c => fn(node, c));
    };
    // If possible, on browsers, batch these mutations as to avoid synchronous layouts.
    // But watch out - if we are batching them, and the page is inactive, we can end up
    // hitching up the page for a very long time as these callbacks queue up on
    // requestAnimationFrame. So only queue them up if the page is visible.
    if (process.browser) {
      // eslint-disable-next-line global-require
      if (!visibilityWatcher) visibilityWatcher = require('visibility')();
      if (visibilityWatcher.visible()) {
        fastdom.mutate(run);
        return;
      }
    }
    run();
  }
}
