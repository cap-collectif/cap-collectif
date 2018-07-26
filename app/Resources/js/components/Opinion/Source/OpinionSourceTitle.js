// @flow
import React from 'react';
import { Label } from 'react-bootstrap';

type Props = {
  source: Object,
};

const OpinionSourceTitle = ({ source }: Props) => {
  return (
    <h3 className="opinion__title">
      <Label bsStyle="primary">{source.category.title}</Label>{' '}
      <a className="external-link" href={source.link}>
        {source.title}
      </a>
    </h3>
  );
};

export default OpinionSourceTitle;
