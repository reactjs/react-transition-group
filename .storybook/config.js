import { configure, addDecorator } from '@storybook/react';
import React from 'react';

addDecorator((storyFn) => <React.StrictMode>{storyFn()}</React.StrictMode>);

function loadStories() {
  require('../stories');
}

configure(loadStories, module);
