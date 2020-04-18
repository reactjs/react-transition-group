const { plugins, rules } = require('webpack-atoms');

module.exports = {
  webpackFinal: (config) => {
    config.module = {
      rules: [
        rules.js(),
        rules.astroturf(),
        rules.css({ extract: false }),
      ],
    };

    config.plugins.push(
      plugins.extractCss({ disable: true })
    )

    return config;
  },
};
