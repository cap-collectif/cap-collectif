// @flow
import { graphql } from 'react-relay';
// import { ConnectionHandler } from 'relay-runtime';
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

// function sharedUpdater(store, SourceableID, type, deletedID) {
//   const SourceableProxy = store.get(SourceableID);
//   if (!SourceableProxy) {
//     return;
//   }
//   const allOrderBy = [
//     { direction: 'DESC', field: 'CREATED_AT' },
//     { direction: 'ASC', field: 'CREATED_AT' },
//     { direction: 'DESC', field: 'VOTES' },
//   ];
//   for (const orderBy of allOrderBy) {
//     const connection = ConnectionHandler.getConnection(
//       SourceableProxy,
//       'SourceListViewPaginated_Sources',
//       {
//         type,
//         orderBy,
//       },
//     );
//     if (connection) {
//       ConnectionHandler.deleteNode(connection, deletedID);
//     }
//   }
// }

const commit = (variables: DeleteSourceMutationVariables): Promise<DeleteSourceMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    // updater: store => {
    //   const payload = store.getRootField('deleteSource');
    //   const Sourceable = payload.getLinkedRecord('Sourceable');

    //   const id = Sourceable.getValue('id');
    //   if (!id || typeof id !== 'string') {
    //     return;
    //   }

    //   sharedUpdater(store, id, type, payload.getValue('deletedSourceId'));

    //   // We update the "FOR" or "AGAINST" row Sources totalCount
    //   const SourceableProxy = store.get(id);
    //   const connection = ConnectionHandler.getConnection(
    //     SourceableProxy,
    //     'SourceList_allSources',
    //     {
    //       type,
    //     },
    //   );
    //   connection.setValue(connection.getValue('totalCount') - 1, 'totalCount');
    // },
  });

export default { commit };
