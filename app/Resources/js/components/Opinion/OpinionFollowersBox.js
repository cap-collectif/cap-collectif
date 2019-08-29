// @flow
import React from 'react';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Row } from 'react-bootstrap';
import UserBox from '../User/UserBox';
import type { OpinionFollowersBox_opinion } from '~relay/OpinionFollowersBox_opinion.graphql';
import { graphqlError } from '../../createRelayEnvironment';
import { PROPOSAL_FOLLOWERS_TO_SHOW } from '../../constants/ProposalConstants';

type Props = {
  opinion: OpinionFollowersBox_opinion,
  relay: RelayPaginationProp,
};

export class OpinionFollowersBox extends React.Component<Props> {
  render() {
    const { opinion, relay } = this.props;
    if (!opinion.followers || !opinion.followers.edges) {
      return graphqlError;
    }
    return (
      <React.Fragment>
        {opinion.followers && opinion.followers.edges && opinion.followers.edges.length !== 0 ? (
          <Row>
            {opinion.followers.edges.filter(Boolean).map((edge, key) => (
              // $FlowFixMe $fragmentRefs is missing
              <UserBox key={key} user={edge.node} className="proposal__follower" />
            ))}
          </Row>
        ) : (
          <div className="well well-lg text-center">
            <i className="cap-32 cap-contacts-1 " />
            <br />
            <FormattedMessage id="no-followers" />
          </div>
        )}

        {relay.hasMore() && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                relay.loadMore(PROPOSAL_FOLLOWERS_TO_SHOW);
              }}
              className="text-center btn btn-secondary">
              <FormattedMessage id="see-more-followers" />
            </button>
          </div>
        )}
      </React.Fragment>
    );
  }
}

export default createPaginationContainer(
  OpinionFollowersBox,
  {
    opinion: graphql`
      fragment OpinionFollowersBox_opinion on Opinion
        @argumentDefinitions(
          count: { type: "Int", defaultValue: 20 }
          cursor: { type: "String", defaultValue: null }
        ) {
        id
        followers(first: $count, after: $cursor) @connection(key: "OpinionFollowersBox_followers") {
          edges {
            cursor
            node {
              ...UserBox_user
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
          totalCount
        }
      }
    `,
  },
  {
    direction: 'forward',
    // $FlowFixMe Type of getConnection is not strict
    getConnectionFromProps(props) {
      return props.opinion && props.opinion.followers;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, { count, cursor }) {
      return {
        count,
        cursor,
        opinionId: props.opinion.id,
      };
    },
    query: graphql`
      query OpinionFollowersBoxQuery($opinionId: ID!, $count: Int!, $cursor: String) {
        opinion: node(id: $opinionId) {
          ...OpinionFollowersBox_opinion @arguments(count: $count, cursor: $cursor)
        }
      }
    `,
  },
);
