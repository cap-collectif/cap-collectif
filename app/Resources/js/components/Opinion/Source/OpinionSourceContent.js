import React, {PropTypes} from 'react';

const OpinionSourceContent = ({source}) => {
  return <p className="excerpt" dangerouslySetInnerHTML={{ __html: source.body }} />;
};

OpinionSourceContent.propTypes = {
  source: PropTypes.object.isRequired,
};

export default OpinionSourceContent;
