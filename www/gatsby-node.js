const path = require('path');
const config = require('./gatsby-config');

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions;
  const componentTemplate = path.join(
    __dirname,
    'src',
    'templates',
    'component.js'
  );
  return new Promise((resolve, reject) => {
    resolve(
      graphql(`
        {
          allComponentMetadata {
            edges {
              node {
                displayName
              }
            }
          }
        }
      `).then(result => {
        if (result.errors) {
          reject(result.errors);
        }
        const { componentPages } = config.siteMetadata;
        result.data.allComponentMetadata.edges
          .filter(({ node: { displayName } }) =>
            componentPages.some(page => page.displayName === displayName)
          )
          .forEach(({ node: { displayName } }) => {
            createPage({
              path: componentPages.find(
                page => page.displayName === displayName
              ).path,
              component: componentTemplate,
              context: {
                displayName,
              },
            });
          });
      })
    );
  });
};
