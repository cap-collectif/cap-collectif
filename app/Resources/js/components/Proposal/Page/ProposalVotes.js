// @flow
import * as React from 'react';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { Row } from 'react-bootstrap';
import UserBox from '../../User/UserBox';
import type { ProposalVotes_proposal } from './__generated__/ProposalVotes_proposal.graphql';

type Props = {
  proposal: ProposalVotes_proposal,
  relay: RelayPaginationProp,
};

type State = {
  loading: boolean,
};

// You also need to update @argumentDefinitions for initial loading
const PROPOSAL_VOTES_PAGINATION = 50;

export class ProposalVotes extends React.Component<Props, State> {
  state = {
    loading: false,
  };

  render() {
    const { proposal, relay } = this.props;
    const votesCount = proposal.votes.totalCount;

    if (proposal.votes.edges && votesCount === 0) {
      return (
        <p>
          <FormattedMessage id="proposal.vote.none" />
        </p>
      );
    }

    return (
      <div>
        {proposal.votes.edges && votesCount !== 0 ? (
          <div className={classNames({ proposal__votes: true })}>
            <h2>
              <FormattedMessage
                id="proposal.vote.count"
                values={{
                  num: votesCount,
                }}
              />
            </h2>
            <Row>
              {proposal.votes.edges.filter(Boolean).map((edge, key) => (
                // $FlowFixMe $refType
                <UserBox key={key} user={edge.node.author} className="proposal__vote" />
              ))}
            </Row>
          </div>
        ) : (
          <div className="well well-lg text-center">
            <FormattedMessage id="proposal.vote.none" />
          </div>
        )}
        {relay.hasMore() && (
          <div className="text-center">
            <button
              className="text-center btn btn-secondary"
              disabled={this.state.loading}
              onClick={() => {
                this.setState({ loading: true });
                relay.loadMore(PROPOSAL_VOTES_PAGINATION, () => {
                  this.setState({ loading: false });
                });
              }}>
              <FormattedMessage id="proposal.vote.show_more" />
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default createPaginationContainer(
  ProposalVotes,
  graphql`
    fragment ProposalVotes_proposal on Proposal
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 50 }
        cursor: { type: "String", defaultValue: null }
        stepId: { type: "ID!", nonNull: true }
      ) {
      id
      votes(first: $count, after: $cursor, stepId: $stepId)
        @connection(key: "ProposalVotes_votes", filters: ["proposalId", "stepId"]) {
        edges {
          node {
            author {
              id
              ...UserBox_user
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
          startCursor
          hasPreviousPage
        }
        totalCount
      }
    }
  `,
  {
    direction: 'forward',
    getConnectionFromProps(props: Props) {
      return props.proposal && props.proposal.votes;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props: Props, { count, cursor }, fragmentVariables) {
      return {
        ...fragmentVariables,
        count,
        cursor,
        proposalId: props.proposal.id,
      };
    },
    query: graphql`
      query ProposalVotesQuery($proposalId: ID!, $count: Int!, $cursor: String, $stepId: ID!) {
        proposal: node(id: $proposalId) {
          id
          ...ProposalVotes_proposal @arguments(count: $count, cursor: $cursor, stepId: $stepId)
        }
      }
    `,
  },
);
