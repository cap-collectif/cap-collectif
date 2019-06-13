// @flow
import React from 'react';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Row } from 'react-bootstrap';
import UserBox from '../../User/UserBox';
import type { ProposalPageFollowers_proposal } from '~relay/ProposalPageFollowers_proposal.graphql';
import { graphqlError } from '../../../createRelayEnvironment';
import { PROPOSAL_FOLLOWERS_TO_SHOW } from '../../../constants/ProposalConstants';

type State = {|
  loading: boolean,
|};
type Props = {|
  proposal: ProposalPageFollowers_proposal,
  relay: RelayPaginationProp,
  pageAdmin: boolean,
|};

export class ProposalPageFollowers extends React.Component<Props, State> {
  state = {
    loading: false,
  };

  render() {
    const { proposal, relay, pageAdmin } = this.props;
    const { loading } = this.state;
    if (!proposal.followers || !proposal.followers.edges) {
      return graphqlError;
    }
    return (
      <div>
        {pageAdmin === false ? (
          <div className="box-header">
            <h3 className="box-title mb-20">
              <FormattedMessage
                values={{ num: proposal.followers.totalCount }}
                id="proposal.follower.count"
              />{' '}
            </h3>
          </div>
        ) : null}

        {proposal.followers.edges.length !== 0 ? (
          <Row>
            {proposal.followers.edges.filter(Boolean).map((edge, key) => (
              // $FlowFixMe $refType
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
              disabled={loading}
              onClick={() => {
                this.setState({ loading: true });
                relay.loadMore(PROPOSAL_FOLLOWERS_TO_SHOW, () => {
                  this.setState({ loading: false });
                });
              }}
              className="text-center btn btn-secondary">
              <FormattedMessage id={loading ? 'global.loading' : 'see-more-followers'} />
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default createPaginationContainer(
  ProposalPageFollowers,
  {
    proposal: graphql`
      fragment ProposalPageFollowers_proposal on Proposal
        @argumentDefinitions(
          count: { type: "Int", defaultValue: 20 }
          cursor: { type: "String", defaultValue: null }
        ) {
        id
        followers(first: $count, after: $cursor)
          @connection(key: "ProposalPageFollowers_followers") {
          edges {
            cursor
            node {
              id
              ...UserBox_user
            }
          }
          pageInfo {
            hasPreviousPage
            hasNextPage
            endCursor
            startCursor
          }
          totalCount
        }
      }
    `,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props: Props) {
      return props.proposal && props.proposal.followers;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props: Props, { count, cursor }) {
      return {
        count,
        cursor,
        proposalId: props.proposal.id,
      };
    },
    query: graphql`
      query ProposalPageFollowersQuery($proposalId: ID!, $count: Int!, $cursor: String) {
        proposal: node(id: $proposalId) {
          ...ProposalPageFollowers_proposal @arguments(count: $count, cursor: $cursor)
        }
      }
    `,
  },
);
