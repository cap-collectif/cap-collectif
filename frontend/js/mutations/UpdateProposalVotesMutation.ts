// @ts-nocheck
import { graphql } from 'react-relay'
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  UpdateProposalVotesMutation$data,
  UpdateProposalVotesMutation$variables,
} from '~relay/UpdateProposalVotesMutation.graphql'

const mutation = graphql`
  mutation UpdateProposalVotesMutation(
    $input: UpdateProposalVotesInput!
    $stepId: ID!
    $isAuthenticated: Boolean!
    $token: String
  ) {
    updateProposalVotes(input: $input) {
      step {
        id
        votesMin
        votesLimit
        ...ProposalVoteModal_step @arguments(token: $token)
        ...ProposalsUserVotesStep_step @arguments(token: $token)
        ...ProposalVoteButtonWrapperFragment_step @arguments(token: $token, isAuthenticated: $isAuthenticated)
        viewerVotes(orderBy: { field: POSITION, direction: ASC }, token: $token) @include(if: $isAuthenticated) {
          ...ProposalsUserVotesTable_votes
          totalCount
          edges {
            node {
              id
              ... on ProposalVote {
                ranking
                anonymous
              }
              proposal {
                id
                ...ProposalVoteButton_proposal @arguments(stepId: $stepId, isAuthenticated: $isAuthenticated)
                votes(stepId: $stepId, first: 0) @include(if: $isAuthenticated) {
                  totalPointsCount
                }
              }
            }
          }
        }
        userVotes: viewerVotes(first: 50, orderBy: { field: POSITION, direction: ASC })
          @connection(key: "VotesList_userVotes", filters: []) {
          edges {
            node {
              id
              proposal {
                id
                ...ProposalPreviewCard_proposal @arguments(stepId: $stepId, isAuthenticated: $isAuthenticated)
              }
            }
          }
        }
      }
    }
  }
`

const commit = (
  variables: UpdateProposalVotesMutation$variables,
  proposalJustVoted:
    | {
        id: string | null | undefined
        position: number
        isVoteRanking: boolean
      }
    | null
    | undefined,
): Promise<UpdateProposalVotesMutation$data> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('updateProposalVotes')
      if (!payload || !payload.getLinkedRecord('step')) return

      if (proposalJustVoted && proposalJustVoted.isVoteRanking) {
        const stepProxy = store.get(variables.input.step)
        if (!stepProxy) return
        const viewerVotes = stepProxy.getLinkedRecord('viewerVotes', {
          orderBy: {
            field: 'POSITION',
            direction: 'ASC',
          },
        })

        if (!viewerVotes) {
          // eslint-disable-next-line no-console
          console.info('no viewer votes found')
          return
        }

        const totalCount = parseInt(viewerVotes.getValue('totalCount'), 10)
        let votesMin = parseInt(stepProxy.getValue('votesMin'), 10)
        if (!votesMin || Number.isNaN(votesMin)) votesMin = 1

        // if votes min is nto targeted we dont account point
        if (votesMin && votesMin > 1 && totalCount < votesMin && !proposalJustVoted.id) {
          // eslint-disable-next-line no-console
          console.info('votesMin not targeted, we dont count points')
          return
        }

        const wereVoteAccounted = totalCount + 1 >= votesMin

        if (!wereVoteAccounted) {
          // eslint-disable-next-line no-console
          console.info('Votes were not accounted')
          return
        }

        // we decrease point counter
        if (proposalJustVoted.id && typeof proposalJustVoted.id === 'string') {
          const votesArgs = {
            first: 0,
            stepId: variables.input.step,
          }
          const votesLimit = parseInt(stepProxy.getValue('votesLimit'), 10)
          const availablePoints = Array.from(
            {
              length: votesLimit,
            },
            (v, l) => votesLimit - l,
          )
          // @ts-expect-error value is tested at line 88
          const removedProposalVote = store.get(proposalJustVoted.id)
          const proposalStore = removedProposalVote?.getLinkedRecord('votes', votesArgs)
          if (!proposalStore) return
          const previousUserPointValue = availablePoints[proposalJustVoted.position]
          const previousValue = parseInt(proposalStore.getValue('totalPointsCount'), 10)
          proposalStore.setValue(previousValue - previousUserPointValue, 'totalPointsCount')
        }
      }
    },
  })

export default {
  commit,
}
