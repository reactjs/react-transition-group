// @ts-ignore
global.requestAnimationFrame = function (callback) {
  setTimeout(callback, 0);
};
