const { NODE_ENV, BABEL_ENV } = process.env
const cjs = NODE_ENV === 'test' || BABEL_ENV === 'cjs'

const presets = [
  ['latest', {
    es2015: { loose: true, modules: false }
  }],
  'stage-2',
  'react'
]

const plugins = [
  'dev-expression',
  'transform-object-assign',
  ['transform-react-remove-prop-types', { mode: 'wrap' }],
  cjs && 'add-module-exports',
  cjs && 'transform-es2015-modules-commonjs',
].filter(Boolean)

module.exports = { plugins, presets }
