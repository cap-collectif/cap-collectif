// @flow
import { graphql, type RecordSourceSelectorProxy } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import commitMutation from './commitMutation';
import environnement from '../createRelayEnvironment';
import type {
  UnfollowOpinionMutationVariables,
  UnfollowOpinionMutationResponse,
} from './__generated__/UnfollowOpinionMutation.graphql';

const mutation = graphql`
  mutation UnfollowOpinionMutation($input: UnfollowOpinionInput!) {
    unfollowOpinion(input: $input) {
      opinion {
        id
        ...OpinionFollowButton_opinion
      }
      unfollowerId
    }
  }
`;

const decrementFollowerCount = (opinionId: string, store: RecordSourceSelectorProxy) => {
  const opinionProxy = store.get(opinionId);
  if (!opinionProxy) return;
  const allFollowersProxy = opinionProxy.getLinkedRecord('followers', { first: 0 });
  if (!allFollowersProxy) return;
  const previousValue = parseInt(allFollowersProxy.getValue('totalCount'), 10);
  allFollowersProxy.setValue(previousValue - 1, 'totalCount');

  const connection = ConnectionHandler.getConnection(opinionProxy, 'OpinionFollowersBox_followers');
  connection.setValue(connection.getValue('totalCount') - 1, 'totalCount');
};

const commit = (
  variables: UnfollowOpinionMutationVariables,
): Promise<UnfollowOpinionMutationResponse> =>
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
      const payload = store.getRootField('unfollowOpinion');
      if (!payload || !payload.getLinkedRecord('opinion')) {
        return;
      }

      if (Array.isArray(variables.input.idsOpinion)) {
        variables.input.idsOpinion.map((id: string) => {
          decrementFollowerCount(id, store);
        });
      }

      if (typeof variables.input.opinionId === 'string') {
        decrementFollowerCount(variables.input.opinionId, store);
      }
    },
  });

export default { commit };
