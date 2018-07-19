const path = require('path');

module.exports = {
  pathPrefix: `/react-transition-group`,
  siteMetadata: {
    title: 'React Transition Group Documentation',
    author: 'Jason Quense',
    componentPages: [
      {
        path: '/transition',
        displayName: 'Transition',
        codeSandboxId: '741op4mmj0',
      },
      {
        path: '/css-transition',
        displayName: 'CSSTransition',
        codeSandboxId: 'm77l2vp00x',
      },
      {
        path: '/transition-group',
        displayName: 'TransitionGroup',
        codeSandboxId: '00rqyo26kn',
      },
    ],
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
        plugins: ['gatsby-remark-prismjs'],
      },
    },
    'gatsby-transformer-react-docgen',
    'gatsby-plugin-sass',
  ],
};
