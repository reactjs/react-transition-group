global.requestAnimationFrame = function (callback) {
  setTimeout(callback, 0);
};
