const path = require('path');

module.exports = {
  siteMetadata: {
    title: 'React Transition Group Documentation',
    author: 'Jason Quense',
  },
  plugins: [
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: path.join(__dirname, 'src/pages'),
        name: 'pages',
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: path.join(__dirname, '../src'),
        name: 'components',
      },
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          'gatsby-remark-prismjs',
        ],
      },
    },
    'gatsby-transformer-react-docgen',
    'gatsby-plugin-sass'
  ],
}
