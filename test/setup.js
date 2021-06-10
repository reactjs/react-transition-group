import React from 'react'

global.requestAnimationFrame = function(callback) {
  setTimeout(callback, 0);
};

const Enzyme = require('enzyme');
const Adapter16 = require('enzyme-adapter-react-16');
const Adapter17 = require('@eps1lon/enzyme-adapter-react-17');

const Adapter = React.version.startsWith('16.') ? Adapter16 : Adapter17;

Enzyme.configure({
  adapter: new Adapter(),
  wrappingComponent: props => <React.StrictMode {...props} />
})
