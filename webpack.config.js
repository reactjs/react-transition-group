const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'react-transition-group.js',
    path: path.join(__dirname, 'lib/dist'),
    library: 'ReactTransitionGroup',
    libraryTarget: 'umd',
  },
  externals: {
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react',
    },
    'react-dom': {
      root: 'ReactDOM',
      commonjs2: 'react-dom',
      commonjs: 'react-dom',
      amd: 'react-dom',
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
      },
    ],
  },
};
