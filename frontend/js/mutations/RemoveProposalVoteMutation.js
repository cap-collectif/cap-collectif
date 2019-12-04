// @flow
import { graphql } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  RemoveProposalVoteMutationVariables,
  RemoveProposalVoteMutationResponse,
} from '~relay/RemoveProposalVoteMutation.graphql';

const mutation = graphql`
  mutation RemoveProposalVoteMutation(
    $input: RemoveProposalVoteInput!
    $stepId: ID!
    $isAuthenticated: Boolean!
  ) {
    removeProposalVote(input: $input) {
      previousVoteId
      step {
        id
        ...ProposalVoteModal_step @arguments(isAuthenticated: $isAuthenticated)
        viewerVotes(orderBy: { field: POSITION, direction: ASC }) @include(if: $isAuthenticated) {
          totalCount
          ...ProposalsUserVotesTable_votes
          totalCount
          edges {
            node {
              id
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
`;

const commit = (
  variables: RemoveProposalVoteMutationVariables,
): Promise<RemoveProposalVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    configs: [
      {
        type: 'NODE_DELETE',
        deletedIDFieldName: 'previousVoteId',
      },
    ],
    updater: (store: ReactRelayRecordSourceSelectorProxy) => {
      const payload = store.getRootField('removeProposalVote');

      if (!payload || !payload.getValue('previousVoteId')) return;

      const proposalProxy = store.get(variables.input.proposalId);
      if (!proposalProxy) return;

      const proposalVotesProxy =
        proposalProxy.getLinkedRecord('votes', {
          first: 0,
          stepId: variables.input.stepId,
        }) || proposalProxy.getLinkedRecord('votes', { first: 0 });

      if (!proposalVotesProxy) return;

      const previousValue = parseInt(proposalVotesProxy.getValue('totalCount'), 10);
      proposalVotesProxy.setValue(previousValue - 1, 'totalCount');
      proposalProxy.setValue(false, 'viewerHasVote', { step: variables.input.stepId });

      const connectionConfig = {
        stepId: variables.input.stepId,
      };

      const connection = ConnectionHandler.getConnection(
        proposalProxy,
        'ProposalVotes_votes',
        connectionConfig,
      );

      if (!connection) return;
      const previousValueConnection = parseInt(connection.getValue('totalCount'), 10);
      connection.setValue(previousValueConnection - 1, 'totalCount');
    },
  });

export default { commit };
