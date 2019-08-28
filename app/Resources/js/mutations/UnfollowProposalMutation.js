// @flow
import { graphql } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import commitMutation from './commitMutation';
import environnement from '../createRelayEnvironment';
import type {
  UnfollowProposalMutationVariables,
  UnfollowProposalMutationResponse,
} from '~relay/UnfollowProposalMutation.graphql';

const mutation = graphql`
  mutation UnfollowProposalMutation($input: UnfollowProposalInput!) {
    unfollowProposal(input: $input) {
      proposal {
        id
        ...ProposalFollowButton_proposal
        followers(first: 0) {
          totalCount
        }
      }
      unfollowerId
    }
  }
`;

const decrementFollowerCount = (proposalId: string, store: RecordSourceSelectorProxy) => {
  const proposalProxy = store.get(proposalId);
  if (!proposalProxy) return;

  const connection = ConnectionHandler.getConnection(
    proposalProxy,
    'ProposalPageFollowers_followers',
  );
  if (connection) {
    connection.setValue(connection.getValue('totalCount') - 1, 'totalCount');
  }
};

const commit = (
  variables: UnfollowProposalMutationVariables,
): Promise<UnfollowProposalMutationResponse> =>
  commitMutation(environnement, {
    mutation,
    variables,
    configs: [
      {
        type: 'RANGE_DELETE',
        // $FlowFixMe
        parentID: variables.input.proposalId || variables.input.idsProposal[0] || '',
        connectionKeys: [
          {
            key: 'ProposalPageFollowers_followers',
          },
        ],
        pathToConnection: ['proposal', 'followers'],
        deletedIDFieldName: 'unfollowerId',
      },
    ],
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('unfollowProposal');
      if (!payload || !payload.getLinkedRecord('proposal')) {
        return;
      }

      if (Array.isArray(variables.input.idsProposal)) {
        variables.input.idsProposal.map((id: string) => {
          decrementFollowerCount(id, store);
        });
      }

      if (typeof variables.input.proposalId === 'string') {
        decrementFollowerCount(variables.input.proposalId, store);
      }
    },
  });

export default { commit };
