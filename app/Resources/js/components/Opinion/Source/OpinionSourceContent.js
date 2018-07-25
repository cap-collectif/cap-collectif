// @flow
import React from 'react';

type Props = {
  source: Object,
};

const OpinionSourceContent = ({ source }: Props) => {
  return <p className="excerpt" dangerouslySetInnerHTML={{ __html: source.body }} />;
};

export default OpinionSourceContent;
