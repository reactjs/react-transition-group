import React from 'react';
import PropTypes from 'prop-types';

const Html = ({ headComponents, body, postBodyComponents }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        {headComponents}
        <script
          async
          src="https://production-assets.codepen.io/assets/embed/ei.js"
        />
        <title>React Transition Group</title>
      </head>
      <body>
        <div id="___gatsby" dangerouslySetInnerHTML={{ __html: body }} />
        {postBodyComponents}
      </body>
    </html>
  );
};

Html.propTypes = {
  headComponents: PropTypes.node.isRequired,
  body: PropTypes.node.isRequired,
  postBodyComponents: PropTypes.node.isRequired,
};

export default Html;
