const { plugins, rules } = require('webpack-atoms');

module.exports = {
  stories: ['../stories/index.js'],
  webpackFinal: (config) => {
    config.module = {
      rules: [
        {
          test: /\.[t|j]sx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        rules.astroturf(),
        rules.css({ extract: false }),
      ],
    };
    config.plugins.push(plugins.extractCss({ disable: true }));

    return config;
  },
};
