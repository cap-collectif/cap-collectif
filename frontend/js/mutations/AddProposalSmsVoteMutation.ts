// @ts-nocheck
import { graphql } from 'react-relay'
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  AddProposalSmsVoteMutationVariables,
  AddProposalSmsVoteMutationResponse,
} from '~relay/AddProposalSmsVoteMutation.graphql'

const mutation = graphql`
  mutation AddProposalSmsVoteMutation($input: AddProposalSmsVoteInput!, $token: String!, $stepId: ID!) {
    addProposalSmsVote(input: $input) {
      errorCode
      voteEdge {
        cursor
        node {
          anonymous
          id
          completionStatus
          proposal {
            contributorVote(step: $stepId, token: $token) {
              id
              completionStatus
            }
          }
          ... on ProposalVote {
            step {
              votesMin
              votesLimit
              project {
                votes {
                  totalCount
                }
                contributors {
                  totalCount
                }
              }
              viewerVotes(orderBy: { field: POSITION, direction: ASC }, token: $token) {
                totalCount
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        }
      }
      errorCode
      participantToken
      shouldTriggerConsentInternalCommunication
    }
  }
`

const commit = (variables: AddProposalSmsVoteMutationVariables): Promise<AddProposalSmsVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    configs: [
      {
        type: 'RANGE_ADD',
        parentID: variables.input.proposalId,
        connectionInfo: [
          {
            key: 'ProposalVotes_votes',
            rangeBehavior: 'prepend',
            filters: {
              stepId: variables.input.stepId,
            },
          },
        ],
        edgeName: 'voteEdge',
      },
    ],
    updater: (store: RecordSourceSelectorProxy) => {
      // START set vote button with voted state
      const proposalProxy = store.get(variables.input.proposalId)
      if (!proposalProxy) return
      const { stepId } = variables.input

      const payload = store.getRootField('addProposalSmsVote')

      const errorCode = payload?.getValue('errorCode')

      if (errorCode) return

      const voteEdge = payload?.getLinkedRecord('voteEdge')

      if (!voteEdge) return

      const node = voteEdge.getLinkedRecord('node')
      proposalProxy.setLinkedRecord(node, 'contributorVote', {
        step: stepId,
      })

      proposalProxy.setValue(true, 'viewerHasVote', {
        step: stepId,
      })
      // END set vote button with voted state

      // update proposal page voter list when all requirements are met
      const proposalVotesProxy = store.get(
        `client:${variables.input.proposalId}:__ProposalVotes_votes_connection(stepId:"${variables.input.stepId}")`,
      )
      if (proposalVotesProxy) {
        const previousValue = parseInt(proposalVotesProxy.getValue('totalCount'), 10)
        proposalVotesProxy.setValue(previousValue + 1, 'totalCount')
      }

      const stepProxy = store.get(variables.input.stepId)
      const votesMin = parseInt(stepProxy.getValue('votesMin'), 10)
      const hasVotesMin = votesMin && votesMin > 0

      // START increment proposal counter when it is first vote
      if (!hasVotesMin) {
        const proposalVotesProxy =
          proposalProxy.getLinkedRecord('votes', {
            first: 0,
            stepId: stepId,
          }) ||
          proposalProxy.getLinkedRecord('votes', {
            first: 0,
          })
        if (!proposalVotesProxy) return
        const previousValue = parseInt(proposalVotesProxy.getValue('totalCount'), 10)
        proposalVotesProxy.setValue(previousValue + 1, 'totalCount')
      }
      // END increment proposal counter when it is first vote
    },
  })

export default {
  commit,
}
