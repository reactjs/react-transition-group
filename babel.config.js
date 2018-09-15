const targets = {
  browsers: ['> 1%', 'last 2 versions']
}

module.exports = {
  presets: [
    ['@babel/env', { loose: true, targets }],
    '@babel/react'
  ],
  plugins: [
    ['@babel/proposal-class-properties', { loose: true }],
    'babel-plugin-add-module-exports',
    ['babel-plugin-transform-react-remove-prop-types', { mode: 'wrap' }],
  ]
}
