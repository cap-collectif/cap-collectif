// @ts-nocheck
import { graphql } from 'react-relay'
import { ConnectionHandler } from 'relay-runtime'
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  AddProposalSmsVoteMutationVariables,
  AddProposalSmsVoteMutationResponse,
} from '~relay/AddProposalSmsVoteMutation.graphql'

const mutation = graphql`
  mutation AddProposalSmsVoteMutation($input: AddProposalSmsVoteInput!, $token: String!) {
    addProposalSmsVote(input: $input) {
      errorCode
      voteEdge {
        cursor
        node {
          id
          __typename
          ... on ProposalSmsVote {
            step {
              votesMin
              votesLimit
              id
              viewerVotes(orderBy: { field: POSITION, direction: ASC }, token: $token) {
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
          }
        }
      }
      votes {
        totalCount
        edges {
          node {
            proposal {
              id
            }
          }
        }
      }
      errorCode
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
      const payload = store.getRootField('addProposalSmsVote')
      const errorCode = payload?.getValue('errorCode')
      const voteEdge = payload?.getLinkedRecord('voteEdge')

      if (!payload) {
        return
      }

      const proposalProxy = store.get(variables.input.proposalId)
      if (!proposalProxy) return
      const votesArgs = {
        first: 0,
        stepId: variables.input.stepId,
      }
      proposalProxy.setValue(true, 'viewerHasVote', {
        step: variables.input.stepId,
      })
      const stepProxy = store.get(variables.input.stepId)
      if (!stepProxy) return
      const stepConnection = stepProxy.getLinkedRecord('viewerVotes', {
        orderBy: {
          field: 'POSITION',
          direction: 'ASC',
        },
      })
      if (!stepConnection) return
      const totalCount = parseInt(stepConnection.getValue('totalCount'), 10)
      stepConnection.setValue(totalCount + 1, 'totalCount')

      if (errorCode === 'VOTE_LIMIT_REACHED') {
        const votes = payload.getLinkedRecord('votes')

        if (votes) {
          stepConnection.copyFieldsFrom(votes)
        }

        return
      }

      // if user is voting with a new token we need to retrieve his old votes and update the current connection which does not contain the token in args
      const updatedViewerVotes = voteEdge
        ?.getLinkedRecord('node')
        ?.getLinkedRecord('step')
        ?.getLinkedRecord('viewerVotes', {
          orderBy: {
            field: 'POSITION',
            direction: 'ASC',
          },
          token: variables.input.token,
        })

      if (updatedViewerVotes) {
        stepConnection.copyFieldsFrom(updatedViewerVotes)
      }

      const proposalVotesProxy =
        proposalProxy.getLinkedRecord('votes', votesArgs) ||
        proposalProxy.getLinkedRecord('votes', {
          first: 0,
        })
      if (!proposalVotesProxy) return
      const previousValue = parseInt(proposalVotesProxy.getValue('totalCount'), 10)
      proposalVotesProxy.setValue(previousValue + 1, 'totalCount')
      const connectionConfig = {
        stepId: variables.input.stepId,
      }
      const connection = ConnectionHandler.getConnection(proposalProxy, 'ProposalVotes_votes', connectionConfig)
      if (!connection) return
      const previousValueConnection = parseInt(connection.getValue('totalCount'), 10)
      connection.setValue(previousValueConnection + 1, 'totalCount')
    },
  })

export default {
  commit,
}
