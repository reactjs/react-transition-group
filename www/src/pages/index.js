import PropTypes from 'prop-types';
import React from 'react';
import Link from 'gatsby-link';

const propTypes = {
  data: PropTypes.shape({
    site: PropTypes.shape({
      siteMetadata: PropTypes.shape({
        componentPages: PropTypes.arrayOf(
          PropTypes.shape({
            path: PropTypes.string.isRequired,
            displayName: PropTypes.string.isRequired,
          })
        ).isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};

class Index extends React.Component {
  render() {
    const { data } = this.props;

    return (
      <div>
        <h1>React Transition Group</h1>
        <section>
          <h2>Getting Started</h2>
          <p />
          <h3 className="h4">Installation</h3>
          <pre className="language-bash">
            <code>
              {`# npm
npm install react-transition-group --save

# yarn
yarn add react-transition-group`}
            </code>
          </pre>

          <h3 className="h4">CDN / External</h3>
          <p>
            Since react-transition-group is fairly small, the overhead of
            including the library in your application is negligible. However, in
            situations where it may be useful to benefit from an external CDN
            when bundling, link to the following CDN:{' '}
            <a href="https://unpkg.com/react-transition-group/dist/react-transition-group.min.js">
              https://unpkg.com/react-transition-group/dist/react-transition-group.min.js
            </a>
          </p>
        </section>
        <h2>Components</h2>
        <ul>
          {data.site.siteMetadata.componentPages.map(
            ({ path, displayName }) => (
              <li key={path}>
                <Link to={path}>{displayName}</Link>
              </li>
            )
          )}
        </ul>
      </div>
    );
  }
}

Index.propTypes = propTypes;

export default Index;

export const pageQuery = graphql`
  query Home {
    ...ComponentPages
  }
`;
