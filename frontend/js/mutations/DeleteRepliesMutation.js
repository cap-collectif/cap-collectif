// @flow
import { graphql } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import commitMutation from './commitMutation';
import environnement from '~/createRelayEnvironment';
import type {
  DeleteRepliesMutationResponse as Response,
  DeleteRepliesMutationVariables,
} from '~relay/DeleteRepliesMutation.graphql';

type Variables = {|
  ...DeleteRepliesMutationVariables,
  +connectionName: string,
|};

const mutation = graphql`
  mutation DeleteRepliesMutation($input: DeleteRepliesInput!) {
    deleteReplies(input: $input) {
      replyIds
    }
  }
`;

const commit = (variables: Variables): Promise<Response> =>
  commitMutation(environnement, {
    mutation,
    variables,
    updater: store => {
      const { connectionName } = variables;

      const deletedReplyIds = store.getRootField('deleteReplies').getValue('replyIds');
      const deletedRepliesCount = deletedReplyIds.length;

      const adminReplies = store.get(connectionName);
      const totalCount = parseInt(adminReplies.getValue('totalCount'), 10);

      const updatedCount = totalCount - deletedRepliesCount;

      if (updatedCount >= 0) {
        adminReplies.setValue(updatedCount, 'totalCount');
      }

      deletedReplyIds.forEach(replyId => {
        ConnectionHandler.deleteNode(adminReplies, replyId);
      });
    },
  });

export default { commit };
