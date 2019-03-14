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

const WithReactRouter = ({ data, location }) => (
  <Layout data={data} location={location}>
    <Container>
      <h1>Usage with React Router</h1>
      <p>
        People often want to animate route transitions, which can result in
        delightful UX when used in moderation. The first instict might be to use
        wrap all routes in <code>TransitionGroup</code>, but that approach
        requires hacks and falls apart easily when used with trickier components
        of React Router like <code>Redirect</code>. You should use{' '}
        <code>CSSTransition</code> for each route and manage their{' '}
        <code>in</code> prop on their own.
      </p>
      <p>
        The main challenge is the <strong>exit</strong> transition because React
        Router changes to a new route instantly, so we need to keep the old
        route around long enough to transition out of it. Fortunately,{' '}
        <code>Route</code>
        's <code>children</code> prop also accepts a <em>function</em>, which
        should not be confused with the <code>render</code> prop! Unlike the{' '}
        <code>render</code> prop, <code>children</code> function runs whether
        the route is matched or not. React Router passes the object containing a{' '}
        <code>match</code> object, which exists if the route matches, otherwise
        it's <code>null</code>. This enables us to manage the <code>in</code>{' '}
        prop of <code>CSSTransition</code> based on the presence of{' '}
        <code>match</code>.
      </p>
      <p>
        Exit transitions will cause the content of routes to linger until they
        disappear, which might pose some styling challenges. Make sure that
        routes don't affect each other's layout, for example you can remove them
        from the flow of the document by using absolute or fixed positioning.
      </p>
      <blockquote>
        <p>
          <b>Note</b>: When using React Transition Group with React Router, make
          sure to avoid using the <code>Switch</code> component because it only
          executes the first matching <code>Route</code>. This would make the
          exit transition impossible to achieve because the exiting route will
          no longer match the current URL and the <code>children</code> function
          won't execute.
        </p>
      </blockquote>
    </Container>
    <Example
      codeSandbox={{
        title: 'CSSTransition + React Router',
        id: '38qm5m0mz1',
      }}
    />
  </Layout>
);

WithReactRouter.propTypes = propTypes;

export default WithReactRouter;

export const pageQuery = graphql`
  query WithReactRouterQuery {
    site {
      ...Layout_site
    }
  }
`;
