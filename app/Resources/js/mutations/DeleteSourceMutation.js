// @flow
import { graphql, type RecordSourceSelectorProxy } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteSourceMutationVariables,
  DeleteSourceMutationResponse,
} from './__generated__/DeleteSourceMutation.graphql';

const mutation = graphql`
  mutation DeleteSourceMutation($input: DeleteSourceInput!) {
    deleteSource(input: $input) {
      sourceable {
        id
      }
      deletedSourceId
    }
  }
`;

function sharedUpdater(store, sourceableID, deletedID) {
  const sourceableProxy = store.get(sourceableID);
  if (!sourceableProxy) {
    return;
  }
  const allOrderBy = [
    { direction: 'DESC', field: 'CREATED_AT' },
    { direction: 'ASC', field: 'CREATED_AT' },
    { direction: 'DESC', field: 'VOTES' },
  ];
  for (const orderBy of allOrderBy) {
    const connection = ConnectionHandler.getConnection(
      sourceableProxy,
      'OpinionSourceListViewPaginated_sources',
      {
        orderBy,
      },
    );
    if (connection) {
      ConnectionHandler.deleteNode(connection, deletedID);
    }
  }
}

const commit = (variables: DeleteSourceMutationVariables): Promise<DeleteSourceMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('deleteSource');
      if (!payload) {
        return;
      }
      const sourceable = payload.getLinkedRecord('sourceable');
      if (!sourceable) {
        return;
      }

      const id = sourceable.getValue('id');
      if (!id || typeof id !== 'string') {
        return;
      }

      sharedUpdater(store, id, payload.getValue('deletedSourceId'));

      const allSourcesProxy = sourceable.getLinkedRecord('sources', { first: 0 });
      if (!allSourcesProxy) return;
      const previousValue = parseInt(allSourcesProxy.getValue('totalCount'), 10);
      allSourcesProxy.setValue(previousValue - 1, 'totalCount');
    },
  });

export default { commit };
