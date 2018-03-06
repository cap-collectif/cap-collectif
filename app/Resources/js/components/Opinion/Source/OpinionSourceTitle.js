// @flow
import React, { PropTypes } from 'react';
import { Label } from 'react-bootstrap';

const OpinionSourceTitle = ({ source }: Object) => {
  return (
    <h3 className="opinion__title">
      <Label bsStyle="primary">{source.category.title}</Label>{' '}
      <a className="external-link" href={source.link}>
        {source.title}
      </a>
    </h3>
  );
};

OpinionSourceTitle.propTypes = {
  source: PropTypes.object.isRequired
};

export default OpinionSourceTitle;
