module.exports = {
  presets: [
    ['babel-preset-jason', { runtime: false }],
    '@babel/preset-typescript',
  ],
  plugins: [
    ['babel-plugin-transform-react-remove-prop-types', { mode: 'wrap' }],
  ],
  env: {
    esm: {
      presets: [
        ['babel-preset-jason', { modules: false }],
        '@babel/preset-typescript',
      ],
    },
  },
};
