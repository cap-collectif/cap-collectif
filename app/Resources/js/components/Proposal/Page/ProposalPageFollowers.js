// @flow
import React from 'react';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Row } from 'react-bootstrap';
import UserBox from '../../User/UserBox';
import type { ProposalPageFollowers_proposal } from './__generated__/ProposalPageFollowers_proposal.graphql';
import { graphqlError } from '../../../createRelayEnvironment';
import { PROPOSAL_FOLLOWERS_TO_SHOW } from '../../../constants/ProposalConstants';

type Props = {
  proposal: ProposalPageFollowers_proposal,
  relay: RelayPaginationProp,
  pageAdmin: boolean,
};

export class ProposalPageFollowers extends React.Component<Props> {
  render() {
    const { proposal, relay, pageAdmin } = this.props;
    if (!proposal.followerConnection.edges) {
      return graphqlError;
    }
    return (
      <div>
        {pageAdmin === false ? (
          <div className="box-header">
            <h3 className="box-title">
              <FormattedMessage
                values={{ num: proposal.followerConnection.totalCount }}
                id="proposal.follower.count"
              />{' '}
            </h3>
          </div>
        ) : (
          ''
        )}

        {proposal.followerConnection.edges.length !== 0 ? (
          <Row>
            {proposal.followerConnection.edges
              .filter(Boolean)
              .map((edge, key) => (
                <UserBox key={key} user={edge.node} className="proposal__follower" />
              ))}
          </Row>
        ) : (
          <div className="well well-lg text-center">
            <FormattedMessage id="no-followers" />
          </div>
        )}

        {relay.hasMore() && (
          <div className="text-center">
            <button
              onClick={() => {
                relay.loadMore(PROPOSAL_FOLLOWERS_TO_SHOW);
              }}
              className="text-center btn btn-secondary">
              <FormattedMessage id="see-more-followers" />
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default createPaginationContainer(
  ProposalPageFollowers,
  graphql`
    fragment ProposalPageFollowers_proposal on Proposal {
      id
      followerConnection(first: $count, after: $cursor)
        @connection(key: "ProposalPageFollowers_followerConnection") {
        edges {
          cursor
          node {
            id
            show_url
            displayName
            username
            contributionsCount
            media {
              url
            }
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
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.proposal && props.proposal.followerConnection;
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
        proposalId: props.proposal.id,
      };
    },
    query: graphql`
      query ProposalPageFollowersQuery($proposalId: ID!, $count: Int!, $cursor: String) {
        proposal: node(id: $proposalId) {
          ...ProposalPageFollowers_proposal
        }
      }
    `,
  },
);
