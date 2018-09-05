// @flow
import React from 'react';
import { ListGroupItem } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import type { VoteItem_vote } from './__generated__/VoteItem_vote.graphql';

type Props = {
  vote: VoteItem_vote,
};

class VoteItem extends React.Component<Props> {
  render() {
    const { vote } = this.props;

    return (
      <ListGroupItem id={`vote-${vote.id}`}>
        {/* $FlowFixMe */}
        <a href={vote.related.url}>
          {vote.related.id} - {vote.related.title}
        </a>
      </ListGroupItem>
    );
  }
}

export default createFragmentContainer(
  VoteItem,
  graphql`
    fragment VoteItem_vote on Vote {
      id
      related {
        id
        url
        ... on Opinion {
          title
        }
        ... on Version {
          title
        }
        ... on Proposal {
          title
        }
        ... on Source {
          title
        }
      }
    }
  `,
);
