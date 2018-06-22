// @flow
import * as React from 'react';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { Row } from 'react-bootstrap';
import UserBox from '../../User/UserBox';
import type { ProposalVotes_proposal } from './__generated__/ProposalVotes_proposal.graphql';

type Props = {
  stepId: string,
  proposal: ProposalVotes_proposal,
  relay: RelayPaginationProp,
};

type State = {
  loading: boolean,
};

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
              {proposal.votes.edges
                .filter(Boolean)
                .map((edge, key) => (
                  <UserBox
                    key={key}
                    user={edge.node.author}
                    username={edge.node.author ? edge.node.author.displayName : 'ANONYMOUS'}
                    className="proposal__vote"
                  />
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
                relay.loadMore(50, () => {
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
        @connection(key: "ProposalVotes_votes", filters: ["stepId"]) {
        edges {
          cursor
          node {
            author {
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
    getVariables(props: Props, { count, cursor }) {
      return {
        count,
        cursor,
        proposalId: props.proposal.id,
        stepId: props.stepId,
      };
    },
    query: graphql`
      query ProposalVotesQuery($proposalId: ID!, $count: Int!, $cursor: String, $stepId: ID!) {
        proposal: node(id: $proposalId) {
          ...ProposalVotes_proposal @arguments(stepId: $stepId, count: $count, after: $cursor)
        }
      }
    `,
  },
);
