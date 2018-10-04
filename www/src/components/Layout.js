import { graphql, Link, withPrefix } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';

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

const NavItem = ({ to, location, children }) => (
  <li role="presentation">
    <Link
      to={to}
      location={location}
      activeStyle={{
        color: '#fff',
        backgroundColor: '#080808',
      }}
    >
      {children}
    </Link>
  </li>
);

NavItem.propTypes = {
  to: PropTypes.string.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  children: PropTypes.node.isRequired,
};

class Layout extends React.Component {
  isActive(path, location) {
    return withPrefix(path) === withPrefix(location.pathname);
  }

  render() {
    const { data, children } = this.props;
    const location = {
      ...this.props.location,
      pathname: withPrefix(this.props.location.pathname),
    };
    return (
      <div>
        <Navbar fixedTop inverse collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="/">React Transition Group</Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav pullLeft>
              {data.site.siteMetadata.componentPages.map(
                ({ path, displayName }) => (
                  <NavItem key={path} to={path} location={location}>
                    {displayName}
                  </NavItem>
                )
              )}
            </Nav>
            <Nav pullRight>
              <NavItem to="/with-react-router" location={location}>
                With React Router
              </NavItem>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <div style={{ paddingTop: '4rem', paddingBottom: '1.5rem' }}>
          {children}
        </div>
      </div>
    );
  }
}

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
