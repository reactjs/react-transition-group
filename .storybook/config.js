import { configure, addDecorator } from '@storybook/react'
import { createElement, StrictMode } from 'react'

addDecorator(
  storyFn => createElement(StrictMode, undefined, storyFn()),
)

function loadStories() {
  require('../stories')
}

configure(loadStories, module)
