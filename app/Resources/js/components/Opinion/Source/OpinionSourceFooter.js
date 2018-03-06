// @flow
import React, { PropTypes } from 'react';
import OpinionSourceButtons from './OpinionSourceButtons';

const OpinionSourceFooter = ({ source }: Object) => {
  return (
    <div className="opinion__votes excerpt small">
      <OpinionSourceButtons source={source} />
    </div>
  );
};

OpinionSourceFooter.propTypes = {
  source: PropTypes.object.isRequired,
};

export default OpinionSourceFooter;
