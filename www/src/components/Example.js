import React from 'react';
import PropTypes from 'prop-types';
import { Container } from 'react-bootstrap';

const propTypes = {
  codeSandbox: PropTypes.shape({
    title: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  }).isRequired,
};

const Example = ({ codeSandbox }) => (
  <div style={{ marginBottom: '1.5rem' }}>
    <Container>
      <h2>Example</h2>
    </Container>
    <iframe
      title={codeSandbox.title}
      src={`https://codesandbox.io/embed/${codeSandbox.id}?fontsize=14`}
      style={{
        display: 'block',
        width: '100%',
        height: '500px',
        border: 0,
        borderRadius: 4,
        overflow: 'hidden',
      }}
      sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
    />
  </div>
);

Example.propTypes = propTypes;

export default Example;
