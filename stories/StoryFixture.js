import PropTypes from 'prop-types';

const propTypes = {
  description: PropTypes.string,
};

function StoryFixture({ description, children }) {
  return (
    <div>
      <p>{description}</p>

      {children}
    </div>
  );
}

StoryFixture.propTypes = propTypes;

export default StoryFixture;
