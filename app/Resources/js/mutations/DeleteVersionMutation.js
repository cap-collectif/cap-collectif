// @flow
import { graphql } from 'react-relay';
// import { ConnectionHandler } from 'relay-runtime';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteVersionMutationVariables,
  DeleteVersionMutationResponse,
} from './__generated__/DeleteVersionMutation.graphql';

const mutation = graphql`
  mutation DeleteVersionMutation($input: DeleteVersionInput!) {
    deleteVersion(input: $input) {
      opinion {
        id
      }
      deletedVersionId
    }
  }
`;

// function sharedUpdater(store, argumentableID, type, deletedID) {
//   const argumentableProxy = store.get(argumentableID);
//   if (!argumentableProxy) {
//     return;
//   }
//   const allOrderBy = [
//     { direction: 'DESC', field: 'CREATED_AT' },
//     { direction: 'ASC', field: 'CREATED_AT' },
//     { direction: 'DESC', field: 'VOTES' },
//   ];
//   for (const orderBy of allOrderBy) {
//     const connection = ConnectionHandler.getConnection(
//       argumentableProxy,
//       'VersionListViewPaginated_arguments',
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

const commit = (
  variables: DeleteVersionMutationVariables,
): Promise<DeleteVersionMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    // updater: store => {
    //   const payload = store.getRootField('deleteVersion');
    //   const argumentable = payload.getLinkedRecord('argumentable');

    //   const id = argumentable.getValue('id');
    //   if (!id || typeof id !== 'string') {
    //     return;
    //   }

    //   sharedUpdater(store, id, type, payload.getValue('deletedVersionId'));

    //   // We update the "FOR" or "AGAINST" row arguments totalCount
    //   const argumentableProxy = store.get(id);
    //   if (!argumentableProxy) return;
    //   const connection = ConnectionHandler.getConnection(
    //     argumentableProxy,
    //     'VersionList_allVersions',
    //     {
    //       type,
    //     },
    //   );
    //   connection.setValue(connection.getValue('totalCount') - 1, 'totalCount');

    //   const allVersionsProxy = argumentableProxy.getLinkedRecord('arguments', { first: 0 });
    //   if (!allVersionsProxy) return;
    //   const previousValue = parseInt(allVersionsProxy.getValue('totalCount'), 10);
    //   allVersionsProxy.setValue(previousValue - 1, 'totalCount');
    // },
  });

export default { commit };
