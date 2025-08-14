import * as React from 'react'
import type { RelayPaginationProp } from 'react-relay'
import { graphql, createPaginationContainer } from 'react-relay'
import { FormattedMessage } from 'react-intl'
import classNames from 'classnames'
import UserBox from '~/components/User/UserBox'
import type { ProposalVotes_proposal } from '~relay/ProposalVotes_proposal.graphql'
import { isInterpellationContextFromProposal } from '~/utils/interpellationLabelHelper'
import { SeeMoreButton } from '~/components/Proposal/Page/ProposalPage.style'

type Props = {
  proposal: ProposalVotes_proposal
  relay: RelayPaginationProp
}
type State = {
  loading: boolean
}
// You also need to update @argumentDefinitions for initial loading
const PROPOSAL_VOTES_PAGINATION = 50
export class ProposalVotes extends React.Component<Props, State> {
  state = {
    loading: false,
  }

  render() {
    const { proposal, relay } = this.props
    const { loading } = this.state
    const votesCount = proposal.votes.totalCount

    if (proposal.votes.edges && votesCount === 0) {
      return (
        <p className="pb-20">
          <FormattedMessage
            id={isInterpellationContextFromProposal(proposal) ? 'interpellation.support.none' : 'proposal.vote.none'}
          />
        </p>
      )
    }

    return (
      <div>
        <div
          className={classNames({
            proposal__votes: true,
          })}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
            }}
          >
            {proposal.votes.edges &&
              proposal.votes.edges
                .filter(Boolean)
                .map(
                  (edge, key) => edge.node && <UserBox key={key} user={edge.node.author} className="proposal__vote" />,
                )}
          </div>
        </div>
        {relay.hasMore() && (
          <div className="text-center">
            <SeeMoreButton
              type="button"
              disabled={loading}
              onClick={() => {
                this.setState({
                  loading: true,
                })
                relay.loadMore(PROPOSAL_VOTES_PAGINATION, () => {
                  this.setState({
                    loading: false,
                  })
                })
              }}
            >
              <FormattedMessage
                id={
                  loading
                    ? 'global.loading'
                    : isInterpellationContextFromProposal(proposal)
                    ? 'interpellation.support.show_more'
                    : 'proposal.vote.show_more'
                }
              />
            </SeeMoreButton>
          </div>
        )}
      </div>
    )
  }
}
export default createPaginationContainer(
  ProposalVotes,
  {
    proposal: graphql`
      fragment ProposalVotes_proposal on Proposal
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 50 }
        cursor: { type: "String" }
        stepId: { type: "ID!" }
      ) {
        id
        ...interpellationLabelHelper_proposal @relay(mask: false)
        votes(first: $count, after: $cursor, stepId: $stepId)
          @connection(key: "ProposalVotes_votes", filters: ["stepId"]) {
          edges {
            node {
              ... on ProposalVote {
                author {
                  id
                  ...UserBox_user
                }
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
  },
  {
    direction: 'forward',

    getConnectionFromProps(props: Props) {
      return props.proposal && props.proposal.votes
    },

    getFragmentVariables(prevVars, totalCount) {
      return { ...prevVars, count: totalCount }
    },

    getVariables(props: Props, { count, cursor }, fragmentVariables) {
      return { ...fragmentVariables, count, cursor, proposalId: props.proposal.id }
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
)
