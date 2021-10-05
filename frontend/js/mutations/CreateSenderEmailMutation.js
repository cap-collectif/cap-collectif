// @flow
import { graphql } from 'react-relay';
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes';
// eslint-disable-next-line import/no-unresolved
import type { DataID } from 'relay-runtime/util/RelayRuntimeTypes';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  CreateSenderEmailMutationVariables,
  CreateSenderEmailMutationResponse,
} from '~relay/CreateSenderEmailMutation.graphql';

const mutation = graphql`
  mutation CreateSenderEmailMutation($input: CreateSenderEmailInput!) {
    createSenderEmail(input: $input) {
      errorCode
      senderEmail {
        id
        address
      }
    }
  }
`;

const commit = (
  variables: CreateSenderEmailMutationVariables,
): Promise<CreateSenderEmailMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('createSenderEmail');
      if (!payload) return;
      const errorCode = payload.getValue('errorCode');
      if (errorCode) return;
      const senderEmailAdded = payload.getLinkedRecord('senderEmail');
      if (!senderEmailAdded) return;

      const rootFields = store.getRoot();

      const senderEmails = rootFields.getLinkedRecords('senderEmails') || [];
      if (!senderEmails) throw new Error('Expected senderEmails to be in the store');

      const senderEmailAddedId = ((senderEmailAdded.getValue('id'): any): DataID);
      const newSenderEmail = store.get(senderEmailAddedId);

      rootFields.setLinkedRecords([...senderEmails, newSenderEmail], 'senderEmails');
    },
  });

export default { commit };
