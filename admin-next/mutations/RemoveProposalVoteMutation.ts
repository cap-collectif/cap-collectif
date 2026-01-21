import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode, RecordSourceSelectorProxy } from 'relay-runtime'
import type {
  RemoveProposalVoteMutation,
  RemoveProposalVoteMutation$data,
  RemoveProposalVoteMutation$variables,
} from '@relay/RemoveProposalVoteMutation.graphql'

const mutation = graphql`
  mutation RemoveProposalVoteMutation($input: RemoveProposalVoteInput!, $stepId: ID!) {
    removeProposalVote(input: $input) {
      previousVoteId
      areRemainingVotesAccounted
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
    }
  }
` as GraphQLTaggedNode

type Variables = RemoveProposalVoteMutation$variables & {
  stepId: string
}

type OptimisticData = {
  proposalId: string
  stepId: string
  voteId: string | null
  currentVotesCount: number
  currentViewerVotesCount: number
  currentCreditsLeft: number | null
  proposalEstimation: number | null
  votesMin: number | null
}

const commit = (variables: Variables, optimisticData?: OptimisticData): Promise<RemoveProposalVoteMutation$data> =>
  commitMutation<RemoveProposalVoteMutation>(environment, {
    mutation,
    variables,
    optimisticUpdater: optimisticData
      ? (store: RecordSourceSelectorProxy) => {
          const {
            proposalId,
            stepId,
            voteId,
            currentVotesCount,
            currentViewerVotesCount,
            currentCreditsLeft,
            proposalEstimation,
            votesMin,
          } = optimisticData

          // Vote was only accounted if votesMin threshold was reached before removal
          const wasVoteAccounted = votesMin === null || currentViewerVotesCount >= votesMin

          // Update proposal
          const proposal = store.get(proposalId)
          if (proposal) {
            proposal.setValue(false, 'viewerHasVote', { step: stepId })
            proposal.setValue(null, 'viewerVote', { step: stepId })

            // Only decrement totalCount if vote was accounted (votesMin was reached)
            const votes = proposal.getLinkedRecord('votes')
            if (votes && wasVoteAccounted) {
              votes.setValue(Math.max(0, currentVotesCount - 1), 'totalCount')
            }
          }

          // Update step viewerVotes
          const step = store.get(stepId)
          if (step) {
            const viewerVotes = step.getLinkedRecord('viewerVotes')
            if (viewerVotes) {
              viewerVotes.setValue(Math.max(0, currentViewerVotesCount - 1), 'totalCount')
              if (currentCreditsLeft !== null && proposalEstimation !== null) {
                viewerVotes.setValue(currentCreditsLeft + proposalEstimation, 'creditsLeft')
              }

              // Remove vote from viewerVotes edges
              if (voteId) {
                const edges = viewerVotes.getLinkedRecords('edges')
                if (edges) {
                  const newEdges = edges.filter(edge => {
                    const node = edge.getLinkedRecord('node')
                    const nodeId = node?.getValue('id')
                    return nodeId !== voteId
                  })
                  viewerVotes.setLinkedRecords(newEdges, 'edges')
                }
              }
            }
          }
        }
      : undefined,
  })

export default { commit }
