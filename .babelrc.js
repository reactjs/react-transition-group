module.exports = {
  presets: [['babel-preset-jason', { runtime: false }]],
  plugins: [['transform-react-remove-prop-types', { mode: 'wrap' }]],
  env: {
    esm: {
      presets: [['babel-preset-jason', { modules: false }]],
    },
  },
}
