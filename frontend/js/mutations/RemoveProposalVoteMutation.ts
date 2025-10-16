// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  RemoveProposalVoteMutation$variables,
  RemoveProposalVoteMutation$data,
} from '~relay/RemoveProposalVoteMutation.graphql'
import { RecordSourceSelectorProxy } from 'relay-runtime'

const mutation = graphql`
  mutation RemoveProposalVoteMutation($input: RemoveProposalVoteInput!, $stepId: ID!) {
    removeProposalVote(input: $input) {
      shouldDecrementContributorsTotalCount
      previousVoteId @deleteRecord
      proposal {
        viewerHasVote(step: $stepId)
        votes(stepId: $stepId, first: 0) {
          totalCount
          totalPointsCount
        }
      }
      step {
        votesMin
        votesLimit
        votesRanking
        project {
          votes {
            totalCount
          }
        }
        id
        viewerVotes(orderBy: { field: POSITION, direction: ASC }) {
          totalCount
          edges {
            node {
              id
              proposal {
                id
                votes(stepId: $stepId, first: 0) {
                  totalPointsCount
                }
              }
            }
          }
        }
      }
      viewer {
        id
        proposalVotes(stepId: $stepId) {
          totalCount
          creditsLeft
          creditsSpent
        }
      }
    }
  }
`

const commit = (variables: RemoveProposalVoteMutation$variables): Promise<RemoveProposalVoteMutation$data> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('removeProposalVote')
      if (!payload) return

      const step = payload.getLinkedRecord('step')
      if (!step) return

      // START DECREMENTING PROJECT CONTRIBUTORS TOTALCOUNT
      const shouldDecrementContributorsTotalCount = payload.getValue('shouldDecrementContributorsTotalCount')
      if (shouldDecrementContributorsTotalCount) {
        const contributors = step.getLinkedRecord('project').getLinkedRecord('contributors')
        contributors.setValue(contributors.getValue('totalCount') - 1, 'totalCount')
      }
      // END DECREMENTING PROJECT CONTRIBUTORS TOTALCOUNT

      const votesMin = step.getValue('votesMin')
      const viewerVotes = step.getLinkedRecord('viewerVotes', {
        orderBy: { field: 'POSITION', direction: 'ASC' },
      })

      if (!viewerVotes) return

      const viewerVotesCount = viewerVotes.getValue('totalCount')

      if (viewerVotesCount >= votesMin) return

      const voteEdges = viewerVotes.getLinkedRecords('edges')

      if (!voteEdges) return

      for (const edge of voteEdges) {
        const node = edge.getLinkedRecord('node')
        if (!node) continue

        const proposal = node.getLinkedRecord('proposal')
        if (!proposal) continue

        const votes = proposal.getLinkedRecord('votes', { stepId: step.getDataID(), first: 0 })
        if (!votes) continue

        const count = votes.getValue('totalCount')
        if (typeof count === 'number' && count > 0) {
          votes.setValue(count - 1, 'totalCount')
        }
      }
    },
  })

export default {
  commit,
}
