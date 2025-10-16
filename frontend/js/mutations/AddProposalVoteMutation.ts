// @ts-nocheck
import { graphql } from 'react-relay'
import { ConnectionHandler } from 'relay-runtime'
import { RecordSourceSelectorProxy } from 'relay-runtime'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  AddProposalVoteMutation$variables,
  AddProposalVoteMutation$data,
} from '~relay/AddProposalVoteMutation.graphql'

const mutation = graphql`
  mutation AddProposalVoteMutation($input: AddProposalVoteInput!, $stepId: ID!) {
    addProposalVote(input: $input) {
      errorCode
      shouldIncrementProjectContributorsTotalCount
      voteEdge {
        cursor
        node {
          anonymous
          id
          completionStatus
          proposal {
            votes(stepId: $stepId, first: 0) {
              totalPointsCount
              totalCount
            }
            id
            viewerVote(step: $stepId) {
              completionStatus
            }
          }
          __typename
          step {
            votesMin
            votesLimit
            id
            viewerVotes(orderBy: { field: POSITION, direction: ASC }) {
              totalCount
              edges {
                node {
                  id
                  ... on ProposalVote {
                    anonymous
                  }
                }
              }
            }
          }
        }
      }
      viewer {
        proposalVotes(stepId: $stepId) {
          totalCount
          creditsLeft
          creditsSpent
        }
      }
      shouldTriggerConsentInternalCommunication
    }
  }
`

const commit = (variables: AddProposalVoteMutation$variables): Promise<AddProposalVoteMutation$data> =>
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

      if (!payload || !payload.getLinkedRecord('voteEdge') || payload.getValue('errorCode')) {
        return
      }

      const proposalProxy = store.get(variables.input.proposalId)
      if (!proposalProxy) return

      const { stepId } = variables.input
      const stepProxy = store.get(stepId)

      // START INCREMENT PROJECT CONTRIBUTORS TOTAL COUNT
      const shouldIncrementProjectContributorsTotalCount = payload.getValue(
        'shouldIncrementProjectContributorsTotalCount',
      )
      if (shouldIncrementProjectContributorsTotalCount) {
        const contributors = stepProxy.getLinkedRecord('project').getLinkedRecord('contributors')
        contributors.setValue(contributors.getValue('totalCount') + 1, 'totalCount')
      }
      // END INCREMENT PROJECT CONTRIBUTORS TOTAL COUNT

      const votesMin = parseInt(stepProxy.getValue('votesMin'), 10)
      const hasVotesMin = votesMin && votesMin > 0

      // update proposal page voter list when all requirements are met
      const proposalVotesProxy =
        proposalProxy.getLinkedRecord('votes', {
          first: 0,
          stepId: stepId,
        }) ||
        proposalProxy.getLinkedRecord('votes', {
          first: 0,
        })

      if (!hasVotesMin && proposalVotesProxy) {
        const previousValue = parseInt(proposalVotesProxy.getValue('totalCount'), 10)
        proposalVotesProxy.setValue(previousValue + 1, 'totalCount')
      }

      if (!stepProxy) return

      const viewerVotesConnection = stepProxy.getLinkedRecord('viewerVotes', {
        orderBy: {
          field: 'POSITION',
          direction: 'ASC',
        },
      })

      if (!viewerVotesConnection) return

      const totalCount = parseInt(viewerVotesConnection.getValue('totalCount'), 10)

      const project = stepProxy?.getLinkedRecord('project', {})
      if (!project) return
      const votes = project?.getLinkedRecord('votes', {})
      if (!votes) return

      const votesArgs = {
        first: 0,
        stepId: stepId,
      }
      proposalProxy.setValue(true, 'viewerHasVote', {
        step: stepId,
      })
      if (!stepProxy) return

      const projectVotesTotalCount = parseInt(votes.getValue('totalCount'), 10)

      const hasReachedVoteMin = votesMin > 1 && totalCount === votesMin

      if (!votesMin || votesMin < 1) {
        votes.setValue(projectVotesTotalCount + 1, 'totalCount')
        return
      }

      if (hasReachedVoteMin) {
        const ids = viewerVotesConnection.getLinkedRecords('edges')?.map(edge => {
          return String(edge?.getLinkedRecord('node')?.getLinkedRecord('proposal')?.getValue('id'))
        })
        ids.forEach((id: string) => {
          const proposal = store.get(id)
          const proposalStore = proposal?.getLinkedRecord('votes', votesArgs)
          if (!proposalStore) return
          const previousValue = parseInt(proposalStore.getValue('totalCount'), 10)
          proposalStore.setValue(previousValue + 1, 'totalCount')
        })
        votes.setValue(projectVotesTotalCount + votesMin, 'totalCount')
      }

      const connectionConfig = {
        stepId,
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
