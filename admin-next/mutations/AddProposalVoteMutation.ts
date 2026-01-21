import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode, RecordSourceSelectorProxy } from 'relay-runtime'
import type {
  AddProposalVoteMutation,
  AddProposalVoteMutation$data,
  AddProposalVoteMutation$variables,
} from '@relay/AddProposalVoteMutation.graphql'

const mutation = graphql`
  mutation AddProposalVoteMutation($input: AddProposalVoteInput!, $stepId: ID!) {
    addProposalVote(input: $input) {
      errorCode
      vote {
        id
        step {
          id
          votesMin
          votesLimit
          budget
          open
          viewerVotes {
            totalCount
            creditsLeft
            edges {
              node {
                id
                ranking
                proposal {
                  id
                  title
                }
              }
            }
          }
          requirements {
            viewerMeetsTheRequirements
          }
          proposals {
            edges {
              node {
                id
                estimation
                viewerHasVote(step: $stepId)
                viewerVote(step: $stepId) {
                  id
                  completionStatus
                }
                votes {
                  totalCount
                }
              }
            }
          }
        }
        completionStatus
      }
    }
  }
` as GraphQLTaggedNode

type Variables = AddProposalVoteMutation$variables & {
  stepId: string
}

type OptimisticData = {
  proposalId: string
  stepId: string
  currentVotesCount: number
  currentViewerVotesCount: number
  currentCreditsLeft: number | null
  proposalEstimation: number | null
  votesMin: number | null
}

const commit = (
  variables: Variables,
  isAuthenticated = true,
  optimisticData?: OptimisticData,
): Promise<AddProposalVoteMutation$data> =>
  commitMutation<AddProposalVoteMutation>(environment, {
    mutation,
    variables: {
      ...variables,
      input: {
        ...variables.input,
        anonymously: !isAuthenticated,
      },
    },
    optimisticUpdater: optimisticData
      ? (store: RecordSourceSelectorProxy) => {
          const {
            proposalId,
            stepId,
            currentVotesCount,
            currentViewerVotesCount,
            currentCreditsLeft,
            proposalEstimation,
            votesMin,
          } = optimisticData

          // Vote is only accounted if votesMin threshold is reached
          const newViewerVotesCount = currentViewerVotesCount + 1
          const isVoteAccounted = votesMin === null || newViewerVotesCount >= votesMin

          // Update proposal
          const proposal = store.get(proposalId)
          if (proposal) {
            proposal.setValue(true, 'viewerHasVote', { step: stepId })

            // Only increment totalCount if vote is accounted (votesMin reached)
            const votes = proposal.getLinkedRecord('votes')
            if (votes && isVoteAccounted) {
              votes.setValue(currentVotesCount + 1, 'totalCount')
            }
          }

          // Update step viewerVotes
          const step = store.get(stepId)
          if (step) {
            const viewerVotes = step.getLinkedRecord('viewerVotes')
            if (viewerVotes) {
              viewerVotes.setValue(currentViewerVotesCount + 1, 'totalCount')
              if (currentCreditsLeft !== null && proposalEstimation !== null) {
                viewerVotes.setValue(currentCreditsLeft - proposalEstimation, 'creditsLeft')
              }

              // Add new vote to viewerVotes edges
              const tempVoteId = `temp-vote-${proposalId}-${Date.now()}`
              const newVote = store.create(tempVoteId, 'ProposalVote')
              newVote.setValue(tempVoteId, 'id')
              newVote.setValue(newViewerVotesCount, 'ranking')

              // Link to existing proposal in the store
              const existingProposal = store.get(proposalId)
              if (existingProposal) {
                newVote.setLinkedRecord(existingProposal, 'proposal')
              }

              // Create new edge
              const newEdge = store.create(`${tempVoteId}-edge`, 'ProposalVoteEdge')
              newEdge.setLinkedRecord(newVote, 'node')

              // Add edge to connection
              const edges = viewerVotes.getLinkedRecords('edges') || []
              viewerVotes.setLinkedRecords([...edges, newEdge], 'edges')
            }
          }
        }
      : undefined,
  })

export default { commit }
