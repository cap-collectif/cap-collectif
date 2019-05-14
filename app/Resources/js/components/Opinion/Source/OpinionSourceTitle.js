// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { Label } from 'react-bootstrap';
import Card from '../../Ui/Card/Card';
import type { OpinionSourceTitle_source } from '~relay/OpinionSourceTitle_source.graphql';

type Props = {
  source: OpinionSourceTitle_source,
};

const OpinionSourceTitle = ({ source }: Props) => (
  <Card.Title tagName="h3" firstElement={false}>
    {source.category && <Label bsStyle="primary">{source.category.title}</Label>}{' '}
    <a className="external-link" href={source.link}>
      {source.title}
    </a>
  </Card.Title>
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
