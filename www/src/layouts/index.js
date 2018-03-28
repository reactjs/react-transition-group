import PropTypes from 'prop-types';
import React from 'react';
import Link from 'gatsby-link';
import { Grid, Navbar, Nav } from 'react-bootstrap';

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
  location: PropTypes.object.isRequired,
};

const NavItem = ({ active, to, children }) => (
  <li role="presentation" className={active ? 'active' : null}>
    <Link aria-selected={active} to={to}>
      {children}
    </Link>
  </li>
);

NavItem.propTypes = {
  active: PropTypes.bool,
  to: PropTypes.string.isRequired,
};

class BaseLayout extends React.Component {
  render() {
    const { data, location, children } = this.props;
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
            <Nav pullRight>
              {data.site.siteMetadata.componentPages.map(
                ({ path, displayName }) => (
                  <NavItem
                    key={path}
                    active={path === location.pathname}
                    to={path}
                  >
                    {displayName}
                  </NavItem>
                )
              )}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Grid style={{ paddingTop: '4rem', paddingBottom: '1rem' }}>
          {children()}
        </Grid>
      </div>
    );
  }
}

BaseLayout.propTypes = propTypes;

export default BaseLayout;

export const exposedComponentsFragment = graphql`
  fragment ComponentPages on RootQueryType {
    site {
      siteMetadata {
        componentPages {
          path
          displayName
        }
      }
    }
  }
`;

export const query = graphql`
  query BaseLayout {
    ...ComponentPages
  }
`;
