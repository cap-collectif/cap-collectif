// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { Label } from 'react-bootstrap';
import type { OpinionSourceTitle_source } from '~relay/OpinionSourceTitle_source.graphql';

type Props = {
  source: OpinionSourceTitle_source,
};

const OpinionSourceTitle = ({ source }: Props) => (
  <h3 className="title">
    {source.category && <Label bsStyle="primary">{source.category.title}</Label>}{' '}
    <a className="external-link" href={source.link}>
      {source.title}
    </a>
  </h3>
);

export default createFragmentContainer(OpinionSourceTitle, {
  source: graphql`
    fragment OpinionSourceTitle_source on Source {
      id
      title
      link
      category {
        title
      }
    }
  `,
});
