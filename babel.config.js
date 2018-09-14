module.exports = {
  presets: [
    ['@babel/env', { loose: true }],
    '@babel/react'
  ],
  plugins: [
    ['@babel/proposal-class-properties', { loose: true }],
    'babel-plugin-add-module-exports',
    ['babel-plugin-transform-react-remove-prop-types', { mode: 'wrap' }],
  ]
}
