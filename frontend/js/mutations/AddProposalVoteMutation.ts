// @ts-nocheck
import { graphql } from 'react-relay'
import { ConnectionHandler } from 'relay-runtime'
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  AddProposalVoteMutationVariables,
  AddProposalVoteMutationResponse,
} from '~relay/AddProposalVoteMutation.graphql'

const mutation = graphql`
  mutation AddProposalVoteMutation($input: AddProposalVoteInput!, $stepId: ID!) {
    addProposalVote(input: $input) {
      errorCode
      voteEdge {
        cursor
        node {
          id
          __typename
          ... on ProposalUserVote {
            author {
              id
              ...UserBox_user
            }
          }
          step {
            votesMin
            votesLimit
            id
            viewerVotes(orderBy: { field: POSITION, direction: ASC }) {
              ...ProposalsUserVotesTable_votes
              totalCount
              edges {
                node {
                  id
                  ... on ProposalUserVote {
                    anonymous
                  }
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

const commit = (variables: AddProposalVoteMutationVariables): Promise<AddProposalVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    configs: [
      // Add the new vote
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
      const payload = store.getRootField('addProposalVote')

      if (!payload || !payload.getLinkedRecord('voteEdge')) {
        return
      }

      const proposalProxy = store.get(variables.input.proposalId)
      if (!proposalProxy) return
      const stepProxy = store.get(variables.input.stepId)

      if (stepProxy) {
        const project = stepProxy?.getLinkedRecord('project', {})

        if (project) {
          const votes = project?.getLinkedRecord('votes', {})

          if (votes) {
            const previousValue = parseInt(votes.getValue('totalCount'), 10)
            votes.setValue(previousValue + 1, 'totalCount')
          }
        }
      }

      const votesArgs = {
        first: 0,
        stepId: variables.input.stepId,
      }
      proposalProxy.setValue(true, 'viewerHasVote', {
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
      const totalCount = parseInt(stepConnection.getValue('totalCount'), 10)
      let votesMin = parseInt(stepProxy.getValue('votesMin'), 10)
      if (!votesMin || Number.isNaN(votesMin)) votesMin = 1
      if (votesMin && votesMin > 1 && totalCount < votesMin) return

      if (votesMin && votesMin > 1 && totalCount === votesMin) {
        const ids =
          stepConnection.getLinkedRecords('edges')?.map(edge => {
            return String(edge?.getLinkedRecord('node')?.getLinkedRecord('proposal')?.getValue('id'))
          }) || []
        ids.forEach((id: string) => {
          const proposal = store.get(id)
          const proposalStore = proposal?.getLinkedRecord('votes', votesArgs)
          if (!proposalStore) return
          const previousValue = parseInt(proposalStore.getValue('totalCount'), 10)
          proposalStore.setValue(previousValue + 1, 'totalCount')
        })
      } else {
        const proposalVotesProxy =
          proposalProxy.getLinkedRecord('votes', votesArgs) ||
          proposalProxy.getLinkedRecord('votes', {
            first: 0,
          })
        if (!proposalVotesProxy) return
        const previousValue = parseInt(proposalVotesProxy.getValue('totalCount'), 10)
        proposalVotesProxy.setValue(previousValue + 1, 'totalCount')
      }

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
