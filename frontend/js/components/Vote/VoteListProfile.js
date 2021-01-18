// @flow
import React, { useState } from 'react';
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { ListGroup, ListGroupItem, Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import type { VoteListProfile_voteList } from '~relay/VoteListProfile_voteList.graphql';
import VoteItem from './VoteItem';

import Loader from '../Ui/FeedbacksIndicators/Loader';

const VOTE_PAGINATION = 5;

type Props = {
  relay: RelayPaginationProp,
  voteList: VoteListProfile_voteList,
};

export const VoteListProfile = ({ voteList, relay }: Props) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleLoadMore = () => {
    setLoading(true);

    relay.loadMore(VOTE_PAGINATION, () => {
      setLoading(false);
    });
  };

  if (voteList.votes.totalCount === 0) {
    return null;
  }

  return (
    <ListGroup bsClass="media-list" componentClass="ul">
      {voteList.votes.edges
        ?.filter(Boolean)
        .map(edge => edge.node)
        .filter(Boolean)
        .map(vote => (
          <VoteItem vote={vote} key={vote.id} />
        ))}
      {relay.hasMore() && (
        <ListGroupItem style={{ textAlign: 'center' }}>
          {loading ? (
            <Loader />
          ) : (
            <Button bsStyle="link" onClick={handleLoadMore}>
              <FormattedMessage id="global.more" />
            </Button>
          )}
        </ListGroupItem>
      )}
    </ListGroup>
  );
};

export default createPaginationContainer(
  VoteListProfile,
  {
    voteList: graphql`
      fragment VoteListProfile_voteList on User
        @argumentDefinitions(count: { type: "Int!" }, cursor: { type: "String" }) {
        id
        votes(first: $count, after: $cursor) @connection(key: "VoteListProfile_votes") {
          totalCount
          edges {
            node {
              id
              ...VoteItem_vote
            }
          }
          pageInfo {
            hasPreviousPage
            hasNextPage
            startCursor
            endCursor
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    // $FlowFixMe Type of getConnection is not strict
    getConnectionFromProps(props: Props) {
      return props.voteList && props.voteList.votes;
    },
    getFragmentVariables(prevVars) {
      return {
        ...prevVars,
      };
    },
    getVariables(props: Props, { count, cursor }, fragmentVariables) {
      return {
        ...fragmentVariables,
        count,
        cursor,
        userId: props.voteList.id,
      };
    },
    query: graphql`
      query VoteListProfileQuery($userId: ID!, $cursor: String, $count: Int!) {
        voteList: node(id: $userId) {
          id
          ...VoteListProfile_voteList @arguments(cursor: $cursor, count: $count)
        }
      }
    `,
  },
);
