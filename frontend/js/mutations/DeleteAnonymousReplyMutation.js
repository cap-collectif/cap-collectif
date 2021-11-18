// @flow
import { graphql } from 'react-relay';
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteAnonymousReplyMutationVariables,
  DeleteAnonymousReplyMutationResponse,
} from '~relay/DeleteAnonymousReplyMutation.graphql';

type Variables = {|
  ...DeleteAnonymousReplyMutationVariables,
  +anonymousRepliesIds: string[],
|};

const mutation = graphql`
  mutation DeleteAnonymousReplyMutation($input: DeleteAnonymousReplyInput!) {
    deleteAnonymousReply(input: $input) {
      questionnaire {
        id
      }
      replyId
    }
  }
`;

const commit = (variables: Variables): Promise<DeleteAnonymousReplyMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('deleteAnonymousReply');
      if (!payload) return;

      const replyId = payload.getValue('replyId');
      if (!replyId) return;

      const questionnaireId = payload.getLinkedRecord('questionnaire')?.getValue('id');
      if (typeof questionnaireId !== 'string') return;

      const questionnaire = store.get(questionnaireId);
      if (!questionnaire) return;

      const rootFields = store.getRoot();
      const args = { ids: variables.anonymousRepliesIds };
      const anonymousReplies = rootFields.getLinkedRecords('nodes', args);

      const updatedAnonymousReplies = anonymousReplies
        ? anonymousReplies.filter(
            replyRecordProxy => !!replyRecordProxy && replyRecordProxy?.getDataID() !== replyId,
          )
        : [];
      rootFields.setLinkedRecords(updatedAnonymousReplies, 'nodes', args);
    },
  });

export default { commit };
