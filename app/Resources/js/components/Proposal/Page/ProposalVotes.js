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

export class ProposalVotes extends React.Component<Props> {
  render() {
    const { proposal, relay } = this.props;
    return (
      <div>
        <br />
        {proposal.votes.edges && proposal.votes.edges.length !== 0 ? (
          <div className={classNames({ proposal__votes: true })}>
            <Row>
              {proposal.votes.edges.filter(Boolean).map((edge, key) => (
                <UserBox
                  key={key}
                  user={edge.node.author}
                  // username={vote.username} Anonymous
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
              onClick={() => {
                relay.loadMore(50);
              }}
              className="text-center btn btn-secondary">
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
        step: { type: "ID!", nonNull: true }
      ) {
      id
      votes(first: $count, after: $cursor, step: $step)
        @connection(key: "ProposalVotes_votes", filters: ["step"]) {
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
        step: props.stepId,
      };
    },
    query: graphql`
      query ProposalVotesQuery($proposalId: ID!, $count: Int!, $cursor: String, $step: ID!) {
        proposal: node(id: $proposalId) {
          ...ProposalVotes_proposal @arguments(step: $step, count: $count, after: $cursor)
        }
      }
    `,
  },
);
