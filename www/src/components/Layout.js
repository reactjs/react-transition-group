import { graphql, Link } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';
import Helmet from 'react-helmet';

import { Navbar, Nav } from 'react-bootstrap';

import '../css/bootstrap.scss';
import '../css/prism-theme.scss';

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
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
};

const Layout = ({ data, children }) => (
  <>
    <Helmet>
      <html lang="en" />
    </Helmet>
    <Navbar fixed="top" bg="dark" variant="dark" expand="md" collapseOnSelect>
      <Navbar.Brand as={Link} to="/">
        React Transition Group
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Nav className="mr-auto">
          {data.site.siteMetadata.componentPages.map(
            ({ path, displayName }) => (
              <Nav.Link key={path} as={Link} to={path} activeClassName="active">
                {displayName}
              </Nav.Link>
            )
          )}
        </Nav>
        <Nav>
          <Nav.Link as={Link} to="/with-react-router" activeClassName="active">
            With React Router
          </Nav.Link>
          <Nav.Link as={Link} to="/testing" activeClassName="active">
            Testing
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
    <div style={{ paddingTop: '5rem' }}>{children}</div>
  </>
);

Layout.propTypes = propTypes;

export default Layout;

export const exposedComponentsFragment = graphql`
  fragment Layout_site on Site {
    siteMetadata {
      componentPages {
        path
        displayName
        codeSandboxId
      }
    }
  }
`;
