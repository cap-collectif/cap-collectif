// @flow
import { graphql } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import commitMutation from './commitMutation';
import environnement from '../createRelayEnvironment';
import type {
  UnfollowOpinionMutationVariables,
  UnfollowOpinionMutationResponse,
} from '~relay/UnfollowOpinionMutation.graphql';

const mutation = graphql`
  mutation UnfollowOpinionMutation($input: UnfollowOpinionInput!) {
    unfollowOpinion(input: $input) {
      opinion {
        id
        ...OpinionFollowButton_opinion
        followers(first: 0) {
          totalCount
        }
      }
      unfollowerId
    }
  }
`;

const decrementFollowerCount = (opinionId: string, store: RecordSourceSelectorProxy) => {
  const opinionProxy = store.get(opinionId);
  if (!opinionProxy) return;

  const connection = ConnectionHandler.getConnection(opinionProxy, 'OpinionFollowersBox_followers');
  if (connection) {
    connection.setValue(connection.getValue('totalCount') - 1, 'totalCount');
  }
};

const commit = (
  variables: UnfollowOpinionMutationVariables,
): Promise<UnfollowOpinionMutationResponse> =>
  commitMutation(environnement, {
    mutation,
    variables,
    configs: [
      {
        type: 'RANGE_DELETE',
        // $FlowFixMe
        parentID: variables.input.opinionId || variables.input.idsOpinion[0] || '',
        connectionKeys: [
          {
            key: 'OpinionFollowersBox_followers',
          },
        ],
        pathToConnection: ['opinion', 'followers'],
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
