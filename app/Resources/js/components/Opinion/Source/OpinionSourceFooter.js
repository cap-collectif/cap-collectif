// @flow
import React from 'react';
import OpinionSourceButtons from './OpinionSourceButtons';

type Props = {
  source: Object,
};

const OpinionSourceFooter = ({ source }: Props) => {
  return (
    <div className="opinion__votes excerpt small">
      <OpinionSourceButtons source={source} />
    </div>
  );
};

export default OpinionSourceFooter;
