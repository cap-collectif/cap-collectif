// @flow
import React, { PropTypes } from 'react';

const OpinionSourceContent = ({ source }: Object) => {
  return <p className="excerpt" dangerouslySetInnerHTML={{ __html: source.body }} />;
};

OpinionSourceContent.propTypes = {
  source: PropTypes.object.isRequired
};

export default OpinionSourceContent;
