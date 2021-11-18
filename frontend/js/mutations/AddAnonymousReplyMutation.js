// @flow
import { graphql } from 'react-relay';
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from "relay-runtime/store/RelayStoreTypes";
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddAnonymousReplyMutationVariables,
  AddAnonymousReplyMutationResponse,
} from '~relay/AddAnonymousReplyMutation.graphql';

type Variables = {|
  ...AddAnonymousReplyMutationVariables,
  +anonymousRepliesIds: string[],
  +isAuthenticated: boolean,
|}

const mutation = graphql`
    mutation AddAnonymousReplyMutation($input: AddAnonymousReplyInput!) {
        addAnonymousReply(input: $input) {
            reply {
                id
                ...ReplyForm_reply
                ...ReplyLink_reply
            }
            questionnaire {
                id
                ...ReplyForm_questionnaire
                ...ReplyLink_questionnaire
            }
            token
        }
    }
`;

const commit = (variables: Variables): Promise<AddAnonymousReplyMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('addAnonymousReply');
      if (!payload) return;

      const reply = payload.getLinkedRecord('reply');
      if (!reply) return;

      const rootFields = store.getRoot();
      const args = {ids: variables.anonymousRepliesIds};
      const anonymousReplies = rootFields.getLinkedRecords('nodes', args);
      if (!anonymousReplies) return;

      const updatedAnonymousReplies = [...anonymousReplies, reply];
      rootFields.setLinkedRecords(updatedAnonymousReplies, 'nodes', args);
    },
  });

export default { commit };
