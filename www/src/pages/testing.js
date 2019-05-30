import { graphql } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';
import { Container } from 'react-bootstrap';
import Layout from '../components/Layout';
import Example from '../components/Example';

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

const Testing = ({ data, location }) => (
  <Layout data={data} location={location}>
    <Container>
      <h1>Testing Components with Transitions</h1>
      <p>
        In some situations, like visual snapshot testing, it's helpful to
        disable transitions so they don't complicate the test, or introduce
        abitrary waits. To make this easier <code>react-transition-group</code>{' '}
        exposes a way to globally toggle transitions. When set,{' '}
        <strong>all</strong> transitions, when toggled, will immediately switch
        to their entered or exited states as appropriate.
      </p>
      <pre className="language-js">
        <code>
          {`
import { config } from 'react-transition-group

config.disabled = true
              `.trim()}
        </code>
      </pre>
      <blockquote>
        <p>
          <b>Note</b>: This <strong>does not</strong> automatically disable
          animations. It only disabled waits in <code>Transition</code>. You may
          also have to disable animation as appropriate for the library.
          example:{' '}
          <a href="http://velocityjs.org/#mock">Mocking in Velocity.js</a>
        </p>
      </blockquote>
    </Container>
  </Layout>
);

Testing.propTypes = propTypes;

export default Testing;

export const pageQuery = graphql`
  query TestingQuery {
    site {
      ...Layout_site
    }
  }
`;
