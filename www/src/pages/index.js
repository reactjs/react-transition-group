import PropTypes from 'prop-types';
import React from 'react';

import ComponentPage from '../components/ComponentPage';

import '../css/bootstrap.scss';
import '../css/prism-theme.css';

const propTypes = {
  data: PropTypes.object.isRequired,
};

class Index extends React.Component {
  render() {
    const { data: { transition, cssTransition, transitionGroup } } = this.props;

    return (
      <div className='container' style={{ marginTop: '2rem' }}>
        <section>
          <h2>Getting Started</h2>
          <p>

          </p>
          <h3 className='h4'>Installation</h3>
<pre>
<code>{`
# npm
npm install react-transition-group --save

# yarn
yarn add react-transition-group
`}
</code>
</pre>
          <h3 className='h4'>CDN / External</h3>

          <p>
          Since react-transition-group is fairly small, the overhead of including the library in your application is
          negligible. However, in situations where it may be useful to benefit from an external CDN when bundling, link
          to the following CDN:

          <a href="https://unpkg.com/react-transition-group/dist/react-transition-group.min.js">
            https://unpkg.com/react-transition-group/dist/react-transition-group.min.js
          </a>
          </p>
        </section>

        <ComponentPage metadata={transition} />
        <ComponentPage metadata={transitionGroup} />
        <ComponentPage metadata={cssTransition} />
      </div>
    );
  }
}

Index.propTypes = propTypes;

export default Index;

export const pageQuery = graphql`
  query Components {
    cssTransition: componentMetadata(displayName: { eq: "CSSTransition" }) {
      ...ComponentPage_metadata
    }
    transition: componentMetadata(displayName: { eq: "Transition" }) {
       ...ComponentPage_metadata
    }
    transitionGroup: componentMetadata(displayName: { eq: "TransitionGroup" }) {
      ...ComponentPage_metadata
    }
  }
`;
