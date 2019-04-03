import { graphql, Link } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';
import { Container } from 'react-bootstrap';
import Layout from '../components/Layout';

const propTypes = {
  location: PropTypes.object.isRequired,
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
    const { data, location } = this.props;

    return (
      <Layout data={data} location={location}>
        <Container>
          <h1>React Transition Group</h1>
          <blockquote>
            <p>
              Exposes simple components useful for defining entering and exiting
              transitions. React Transition Group is not an animation library
              like{' '}
              <a href="https://github.com/chenglou/react-motion">
                React-Motion
              </a>
              , it does not animate styles by itself. Instead it exposes
              transition stages, manages classes and group elements and
              manipulates the DOM in useful ways, making the implementation of
              actual visual transitions much easier.
            </p>
          </blockquote>
          <section>
            <h2>Getting Started</h2>
            <p />
            <h3 className="h4">Installation</h3>
            <pre className="language-bash">
              <code>
                {`
# npm
npm install react-transition-group --save

# yarn
yarn add react-transition-group
              `.trim()}
              </code>
            </pre>

            <h3 className="h4">CDN / External</h3>
            <p>
              Since react-transition-group is fairly small, the overhead of
              including the library in your application is negligible. However,
              in situations where it may be useful to benefit from an external
              CDN when bundling, link to the following CDN:{' '}
              <a href="https://unpkg.com/react-transition-group/dist/react-transition-group.js">
                https://unpkg.com/react-transition-group/dist/react-transition-group.js
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
        </Container>
      </Layout>
    );
  }
}

Index.propTypes = propTypes;

export default Index;

export const pageQuery = graphql`
  query HomeQuery {
    site {
      ...Layout_site
    }
  }
`;
