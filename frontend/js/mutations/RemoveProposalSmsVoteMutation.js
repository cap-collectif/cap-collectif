// @flow
import { graphql } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  RemoveProposalSmsVoteMutationVariables,
  RemoveProposalSmsVoteMutationResponse,
} from '~relay/RemoveProposalSmsVoteMutation.graphql';

const mutation = graphql`
    mutation RemoveProposalSmsVoteMutation(
        $input: RemoveProposalSmsVoteInput!
        $isAuthenticated: Boolean!
        $token: String
    ) {
        removeProposalSmsVote(input: $input) {
            previousVoteId @deleteRecord
            step {
                id
                ...ProposalVoteModal_step @arguments(isAuthenticated: $isAuthenticated, token: $token)
                ...ProposalVoteButtonWrapperFragment_step @arguments(isAuthenticated: $isAuthenticated, token: $token)
                viewerVotes(orderBy: { field: POSITION, direction: ASC }, token: $token) 
                {
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
            errorCode
        }
    }
`;

const commit = (
  variables: RemoveProposalSmsVoteMutationVariables,
): Promise<RemoveProposalSmsVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('removeProposalSmsVote');

      if (!payload || !payload.getValue('previousVoteId')) return;

      const proposalProxy = store.get(variables.input.proposalId);
      if (!proposalProxy) return;

      const votesArgs = {
        first: 0,
        stepId: variables.input.stepId,
      };

      proposalProxy.setValue(false, 'viewerHasVote', { step: variables.input.stepId });

      const stepProxy = store.get(variables.input.stepId);
      if (!stepProxy) return;
      const stepConnection = stepProxy.getLinkedRecord('viewerVotes', {
        orderBy: { field: 'POSITION', direction: 'ASC' },
      });

      if (!stepConnection) return;

      const viewerVotesTotalCount = parseInt(stepConnection.getValue('totalCount'), 10);
      stepConnection.setValue(viewerVotesTotalCount - 1, 'totalCount');

      const proposalVotesProxy =
        proposalProxy.getLinkedRecord('votes', {
          first: 0,
          stepId: variables.input.stepId,
        }) || proposalProxy.getLinkedRecord('votes', { first: 0 });

      if (!proposalVotesProxy) return;

      const totalCount = parseInt(stepConnection.getValue('totalCount'), 10);
      stepConnection.setValue(totalCount, 'totalCount');

      let votesMin = parseInt(stepProxy.getValue('votesMin'), 10);
      if (!votesMin || Number.isNaN(votesMin)) votesMin = 1;
      if (votesMin && votesMin > 1 && totalCount < votesMin - 1) return;

      if (votesMin && votesMin > 1 && totalCount === votesMin - 1) {
        const ids =
          stepConnection.getLinkedRecords('edges')?.map(edge => {
            return String(
              edge
                ?.getLinkedRecord('node')
                ?.getLinkedRecord('proposal')
                ?.getValue('id'),
            );
          }) || [];

        ids.forEach((id: string) => {
          const proposal = store.get(id);
          const proposalStore = proposal?.getLinkedRecord('votes', votesArgs);
          if (!proposalStore) return;
          const previousValue = parseInt(proposalStore.getValue('totalCount'), 10);
          proposalStore.setValue(previousValue - 1, 'totalCount');
        });
      }
      const previousValue = parseInt(proposalVotesProxy.getValue('totalCount'), 10);
      proposalVotesProxy.setValue(previousValue - 1, 'totalCount');

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
