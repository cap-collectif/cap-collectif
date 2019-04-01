// @flow
import React, { Component } from 'react';
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

type State = {
  loading: boolean,
};

export class VoteListProfile extends Component<Props, State> {
  state = {
    loading: false,
  };

  handleLoadMore = () => {
    this.setState({ loading: true });
    this.props.relay.loadMore(VOTE_PAGINATION, () => {
      this.setState({ loading: false });
    });
  };

  render() {
    const { voteList, relay } = this.props;

    if (!voteList.votes.edges || voteList.votes.edges.length === 0) {
      return null;
    }

    return (
      <ListGroup bsClass="media-list" componentClass="ul">
        {voteList.votes.edges
          .filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean)
          .map(vote => (
            // $FlowFixMe
            <VoteItem vote={vote} key={vote.id} />
          ))}
        {relay.hasMore() && (
          <ListGroupItem style={{ textAlign: 'center' }}>
            {this.state.loading ? (
              <Loader />
            ) : (
              <Button bsStyle="link" onClick={this.handleLoadMore}>
                <FormattedMessage id="global.more" />
              </Button>
            )}
          </ListGroupItem>
        )}
      </ListGroup>
    );
  }
}

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
      query VoteListProfileQuery($userId: ID!, $cursor: String, $count: Int) {
        voteList: node(id: $userId) {
          id
          ...VoteListProfile_voteList @arguments(cursor: $cursor, count: $count)
        }
      }
    `,
  },
);
