// @ts-nocheck
import { graphql } from 'react-relay'
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  RemoveProposalSmsVoteMutationVariables,
  RemoveProposalSmsVoteMutationResponse,
} from '~relay/RemoveProposalSmsVoteMutation.graphql'

const mutation = graphql`
  mutation RemoveProposalSmsVoteMutation(
    $input: RemoveProposalSmsVoteInput!
    $token: String
    $stepId: ID!
  ) {
    removeProposalSmsVote(input: $input) {
      previousVoteId @deleteRecord
      proposal {
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
            contributors {
                totalCount
            }
        }
        id
        viewerVotes(orderBy: { field: POSITION, direction: ASC }, token: $token) {
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
      errorCode
    }
  }
`

const commit = (variables: RemoveProposalSmsVoteMutationVariables): Promise<RemoveProposalSmsVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      const proposalProxy = store.get(variables.input.proposalId)

      const {stepId} = variables.input

      const proposalVotesProxy =
        proposalProxy.getLinkedRecord('votes', {
          first: 0,
          stepId,
        }) ||
        proposalProxy.getLinkedRecord('votes', {
          first: 0,
        })

      if (!proposalVotesProxy) return

      const previousValue = parseInt(proposalVotesProxy.getValue('totalCount'), 10);
      if (previousValue > 0) {
        proposalVotesProxy.setValue(previousValue - 1, 'totalCount')
      }

      const stepProxy = store.get(stepId)
      const project = stepProxy?.getLinkedRecord('project', {})
      if (!project) return
      const votesMin = parseInt(stepProxy.getValue('votesMin'), 10)
      const votes = project?.getLinkedRecord('votes', {})
      if (!votes) return;
      const projectVotesTotalCount = votes.getValue('totalCount');

      if (!votesMin || votesMin < 1) {
        votes.setValue(projectVotesTotalCount - 1, 'totalCount')
        return;
      }

      const viewerVotesConnection = stepProxy.getLinkedRecord('viewerVotes', {
        orderBy: {
          field: 'POSITION',
          direction: 'ASC',
        },
        token: variables.input.token
      })
      const viewerVotesTotalCount = parseInt(viewerVotesConnection.getValue('totalCount'), 10)

      const isBelowVoteMin = (votesMin && votesMin > 1) && viewerVotesTotalCount < votesMin
      const isFirstDeletedVote = votesMin - 1 === viewerVotesTotalCount;

      if (isBelowVoteMin && isFirstDeletedVote) {
        votes.setValue(projectVotesTotalCount - votesMin, 'totalCount');
      }

      const votesRanking = stepProxy.getValue('votesRanking');
      if (votesRanking) {
        const edges = viewerVotesConnection.getLinkedRecords('edges');

        edges?.forEach((edge) => {
          const node = edge.getLinkedRecord('node');
          const proposal = node.getLinkedRecord('proposal');
          const votes = proposal.getLinkedRecord('votes', { stepId, first: 0 });

          if (votes) {
            votes.setValue(0, 'totalPointsCount');
          }
        });

        proposalProxy.getLinkedRecord('votes', { stepId, first: 0 }).setValue(0, 'totalPointsCount');
      }
    },
  })

export default {
  commit,
}
