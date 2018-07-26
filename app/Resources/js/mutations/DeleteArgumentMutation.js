// @flow
import { graphql } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteArgumentMutationVariables,
  DeleteArgumentMutationResponse,
} from './__generated__/DeleteArgumentMutation.graphql';

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

function sharedUpdater(store, argumentableID, type, deletedID) {
  const argumentableProxy = store.get(argumentableID);
  if (!argumentableProxy) {
    return;
  }
  const allOrderBy = [
    { direction: 'DESC', field: 'CREATED_AT' },
    { direction: 'ASC', field: 'CREATED_AT' },
    { direction: 'DESC', field: 'VOTES' },
  ];
  for (const orderBy of allOrderBy) {
    const connection = ConnectionHandler.getConnection(
      argumentableProxy,
      'ArgumentListViewPaginated_arguments',
      {
        type,
        orderBy,
      },
    );
    if (connection) {
      ConnectionHandler.deleteNode(connection, deletedID);
    }
  }
}

const commit = (
  variables: DeleteArgumentMutationVariables,
  type: 'FOR' | 'AGAINST',
): Promise<DeleteArgumentMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: store => {
      const payload = store.getRootField('deleteArgument');
      const argumentable = payload.getLinkedRecord('argumentable');

      const id = argumentable.getValue('id');
      if (!id || typeof id !== 'string') {
        return;
      }

      sharedUpdater(store, id, type, payload.getValue('deletedArgumentId'));

      // We update the "FOR" or "AGAINST" row arguments totalCount
      const argumentableProxy = store.get(id);
      if (!argumentableProxy) return;
      const connection = ConnectionHandler.getConnection(
        argumentableProxy,
        'ArgumentList_allArguments',
        {
          type,
        },
      );
      connection.setValue(connection.getValue('totalCount') - 1, 'totalCount');

      const allArgumentsProxy = argumentableProxy.getLinkedRecord('arguments', { first: 0 });
      if (!allArgumentsProxy) return;
      const previousValue = parseInt(allArgumentsProxy.getValue('totalCount'), 10);
      allArgumentsProxy.setValue(previousValue - 1, 'totalCount');
    },
  });

export default { commit };
