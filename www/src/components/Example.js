import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  codeSandbox: PropTypes.shape({
    title: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  }).isRequired,
};

const Example = ({ codeSandbox }) => (
  <div>
    <h2>Example</h2>
    <div
      dangerouslySetInnerHTML={{
        __html: `
          <iframe
            title="${codeSandbox.title}"
            src="https://codesandbox.io/embed/${codeSandbox.id}?fontsize=14"
            style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
            sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
          />`,
      }}
    />
  </div>
);

Example.propTypes = propTypes;

export default Example;
