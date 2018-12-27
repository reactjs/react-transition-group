const { plugins, rules } = require('webpack-atoms');

module.exports = (config) => {
  config.module = {
    rules: [
      rules.js.inlineCss(),
      rules.css({ modules: true }),
    ],
  };

  config.plugins.push(
    plugins.extractCss({ disable: true })
  )
  return config;
};
