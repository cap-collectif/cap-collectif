// @flow
import { graphql, type RecordSourceSelectorProxy } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import commitMutation from './commitMutation';
import environnement from '../createRelayEnvironment';
import type {
  UnfollowProposalMutationVariables,
  UnfollowProposalMutationResponse,
} from './__generated__/UnfollowProposalMutation.graphql';

const mutation = graphql`
  mutation UnfollowProposalMutation($input: UnfollowProposalInput!) {
    unfollowProposal(input: $input) {
      proposal {
        id
        ...ProposalFollowButton_proposal
      }
      unfollowerId
    }
  }
`;

const decrementFollowerCount = (proposalId: string, store: RecordSourceSelectorProxy) => {
  const proposalProxy = store.get(proposalId);
  if (!proposalProxy) return;
  const allFollowersProxy = proposalProxy.getLinkedRecord('followers', { first: 0 });
  if (!allFollowersProxy) return;
  const previousValue = parseInt(allFollowersProxy.getValue('totalCount'), 10);
  allFollowersProxy.setValue(previousValue - 1, 'totalCount');

  const connection = ConnectionHandler.getConnection(
    proposalProxy,
    'ProposalPageFollowers_followers',
  );
  connection.setValue(connection.getValue('totalCount') - 1, 'totalCount');
};

const commit = (
  variables: UnfollowProposalMutationVariables,
): Promise<UnfollowProposalMutationResponse> =>
  commitMutation(environnement, {
    mutation,
    variables,
    configs: [
      {
        type: 'NODE_DELETE',
        deletedIDFieldName: 'unfollowerId',
      },
    ],
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('unfollowProposal');
      if (!payload || !payload.getLinkedRecord('proposal')) {
        return;
      }

      if (Array.isArray(variables.input.ids)) {
        variables.input.ids.map((id: string) => {
          decrementFollowerCount(id, store);
        });
      }

      if (typeof variables.input.proposalId === 'string') {
        decrementFollowerCount(variables.input.proposalId, store);
      }
    },
  });

export default { commit };
