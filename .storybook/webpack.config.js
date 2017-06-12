module.exports = (config) => {
  config.plugins = config.plugins
    .filter(p => p.constructor.name !== 'CaseSensitivePathsPlugin');

  config.module = {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader!css-literal-loader',
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
      },
    ],
  };

  return config;
};
