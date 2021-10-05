// @flow
import { graphql } from 'react-relay';
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes';
// eslint-disable-next-line import/no-unresolved
import type { DataID } from 'relay-runtime/util/RelayRuntimeTypes';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  CreateSenderEmailDomainMutationVariables,
  CreateSenderEmailDomainMutationResponse,
} from '~relay/CreateSenderEmailDomainMutation.graphql';

const mutation = graphql`
  mutation CreateSenderEmailDomainMutation($input: CreateSenderEmailDomainInput!) {
    createSenderEmailDomain(input: $input) {
      errorCode
      senderEmailDomain {
        ...SectionSendingDomains_senderEmailDomains
      }
    }
  }
`;

const commit = (
  variables: CreateSenderEmailDomainMutationVariables,
): Promise<CreateSenderEmailDomainMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('createSenderEmailDomain');
      if (!payload) return;
      const errorCode = payload.getValue('errorCode');
      if (errorCode) return;
      const senderEmailDomainAdded = payload.getLinkedRecord('senderEmailDomain');
      if (!senderEmailDomainAdded) return;

      const rootFields = store.getRoot();

      const senderEmailDomains = rootFields.getLinkedRecords('senderEmailDomains') || [];
      if (!senderEmailDomains) throw new Error('Expected senderEmailDomains to be in the store');

      const senderEmailDomainAddedId = ((senderEmailDomainAdded.getValue('id'): any): DataID);
      const newSenderEmailDomain = store.get(senderEmailDomainAddedId);

      rootFields.setLinkedRecords(
        [...senderEmailDomains, newSenderEmailDomain],
        'senderEmailDomains',
      );
    },
  });

export default { commit };
