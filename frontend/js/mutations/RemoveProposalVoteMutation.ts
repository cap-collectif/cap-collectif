// @ts-nocheck
import { graphql } from 'react-relay'
import { ConnectionHandler } from 'relay-runtime'
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  RemoveProposalVoteMutationVariables,
  RemoveProposalVoteMutationResponse,
} from '~relay/RemoveProposalVoteMutation.graphql'

const mutation = graphql`
  mutation RemoveProposalVoteMutation(
    $input: RemoveProposalVoteInput!
    $stepId: ID!
    $isAuthenticated: Boolean!
    $token: String
  ) {
    removeProposalVote(input: $input) {
      previousVoteId @deleteRecord
      step {
        id
        ...ProposalVoteModal_step @arguments(isAuthenticated: $isAuthenticated, token: $token)
        ...ProposalVoteButtonWrapperFragment_step @arguments(token: $token)
        viewerVotes(orderBy: { field: POSITION, direction: ASC }, token: $token) @include(if: $isAuthenticated) {
          ...ProposalsUserVotesTable_votes
          totalCount
          edges {
            node {
              id
              proposal {
                id
              }
            }
          }
        }
        ...interpellationLabelHelper_step @relay(mask: false)
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

const commit = (variables: RemoveProposalVoteMutationVariables): Promise<RemoveProposalVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('removeProposalVote')
      const previousVoteId = payload?.getValue('previousVoteId')
      if (!payload || !previousVoteId) return
      const proposalProxy = store.get(variables.input.proposalId)
      if (!proposalProxy) return
      const stepProxy = store.get(variables.input.stepId)

      if (stepProxy) {
        const connectionRecord = ConnectionHandler.getConnection(stepProxy, 'VotesList_viewerVotes', {})

        if (connectionRecord) {
          ConnectionHandler.deleteNode(connectionRecord, String(previousVoteId))
          const viewerVotes = stepProxy?.getLinkedRecord('viewerVotes', {})

          if (viewerVotes) {
            const previousValue = parseInt(viewerVotes.getValue('totalCount'), 10)
            viewerVotes.setValue(previousValue - 1, 'totalCount')
          }
        }

        const project = stepProxy?.getLinkedRecord('project', {})

        if (project) {
          const votes = project?.getLinkedRecord('votes', {})

          if (votes) {
            const previousValue = parseInt(votes.getValue('totalCount'), 10)
            votes.setValue(previousValue - 1, 'totalCount')
          }
        }
      }

      const votesArgs = {
        first: 0,
        stepId: variables.input.stepId,
      }
      proposalProxy.setValue(false, 'viewerHasVote', {
        step: variables.input.stepId,
      })
      if (!stepProxy) return
      const stepConnection = stepProxy.getLinkedRecord('viewerVotes', {
        orderBy: {
          field: 'POSITION',
          direction: 'ASC',
        },
      })
      if (!stepConnection) return
      const proposalVotesProxy =
        proposalProxy.getLinkedRecord('votes', {
          first: 0,
          stepId: variables.input.stepId,
        }) ||
        proposalProxy.getLinkedRecord('votes', {
          first: 0,
        })
      if (!proposalVotesProxy) return
      const totalCount = parseInt(stepConnection.getValue('totalCount'), 10)
      stepConnection.setValue(totalCount, 'totalCount')
      let votesMin = parseInt(stepProxy.getValue('votesMin'), 10)
      if (!votesMin || Number.isNaN(votesMin)) votesMin = 1
      if (votesMin && votesMin > 1 && totalCount < votesMin - 1) return

      if (votesMin && votesMin > 1 && totalCount === votesMin - 1) {
        const ids =
          stepConnection.getLinkedRecords('edges')?.map(edge => {
            return String(edge?.getLinkedRecord('node')?.getLinkedRecord('proposal')?.getValue('id'))
          }) || []
        ids.forEach((id: string) => {
          const proposal = store.get(id)
          const proposalStore = proposal?.getLinkedRecord('votes', votesArgs)
          if (!proposalStore) return
          const previousValue = parseInt(proposalStore.getValue('totalCount'), 10)
          proposalStore.setValue(previousValue - 1, 'totalCount')
        })
      }

      const previousValue = parseInt(proposalVotesProxy.getValue('totalCount'), 10)
      proposalVotesProxy.setValue(previousValue - 1, 'totalCount')
      const connectionConfig = {
        stepId: variables.input.stepId,
      }
      const connection = ConnectionHandler.getConnection(proposalProxy, 'ProposalVotes_votes', connectionConfig)
      if (!connection) return
      const previousValueConnection = parseInt(connection.getValue('totalCount'), 10)
      connection.setValue(previousValueConnection - 1, 'totalCount')
    },
  })

export default {
  commit,
}
