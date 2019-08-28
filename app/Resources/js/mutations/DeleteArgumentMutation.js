// @flow
import { graphql } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteArgumentMutationVariables,
  DeleteArgumentMutationResponse,
} from '~relay/DeleteArgumentMutation.graphql';

const mutation = graphql`
  mutation DeleteArgumentMutation($input: DeleteArgumentInput!) {
    deleteArgument(input: $input) {
      argumentable {
        id
      }
      deletedArgumentId
    }
  }
`;

const commit = (
  variables: DeleteArgumentMutationVariables,
  type: 'FOR' | 'AGAINST',
  published: boolean,
): Promise<DeleteArgumentMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    configs: [
      {
        type: 'NODE_DELETE',
        deletedIDFieldName: 'deletedArgumentId',
      },
    ],
    updater: (store: ReactRelayRecordSourceSelectorProxy) => {
      const payload = store.getRootField('deleteArgument');
      if (!payload) return;
      const argumentable = payload.getLinkedRecord('argumentable');
      if (!argumentable) return;

      const id = argumentable.getValue('id');
      if (!id || typeof id !== 'string') {
        return;
      }

      const argumentableProxy = store.get(id);
      if (!argumentableProxy) {
        throw new Error('Expected argumentable to be in the store');
      }

      // We update the "FOR" or "AGAINST" row arguments totalCount
      if (published) {
        const connection = ConnectionHandler.getConnection(
          argumentableProxy,
          'ArgumentList_allArguments',
          {
            type,
          },
        );
        if (!connection) {
          throw new Error('Expected "ArgumentList_allArguments" to be in the store');
        }
        // $FlowFixMe argument 1 must be a int
        connection.setValue(connection.getValue('totalCount') - 1, 'totalCount');

        const allArgumentsProxy = argumentableProxy.getLinkedRecord('arguments', { first: 0 });
        if (!allArgumentsProxy) return;
        const previousValue = parseInt(allArgumentsProxy.getValue('totalCount'), 10);
        allArgumentsProxy.setValue(previousValue - 1, 'totalCount');
      }

      if (!published) {
        const connection = ConnectionHandler.getConnection(
          argumentableProxy,
          'UnpublishedArgumentList_viewerArgumentsUnpublished',
          {
            type,
          },
        );
        if (!connection) {
          throw new Error(
            'Expected "UnpublishedArgumentList_viewerArgumentsUnpublished" to be in the store',
          );
        }
        // $FlowFixMe argument 1 must be a int
        connection.setValue(connection.getValue('totalCount') - 1, 'totalCount');
      }
    },
  });

export default { commit };
