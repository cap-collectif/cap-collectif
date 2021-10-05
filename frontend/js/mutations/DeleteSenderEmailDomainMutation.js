// @flow
import { graphql } from 'react-relay';
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteSenderEmailDomainMutationResponse,
  DeleteSenderEmailDomainMutationVariables,
} from '~relay/DeleteSenderEmailDomainMutation.graphql';

const mutation = graphql`
  mutation DeleteSenderEmailDomainMutation($input: DeleteSenderEmailDomainInput!) {
    deleteSenderEmailDomain(input: $input) {
      errorCode
      deletedId
    }
  }
`;

const commit = (
  variables: DeleteSenderEmailDomainMutationVariables,
): Promise<DeleteSenderEmailDomainMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('deleteSenderEmailDomain');
      if (!payload) return;
      const errorCode = payload.getValue('errorCode');
      if (errorCode) return;
      const senderEmailDomainRemovedId = payload.getValue('deletedId');
      if (!senderEmailDomainRemovedId) return;

      const rootFields = store.getRoot();

      const senderEmailDomains = rootFields.getLinkedRecords('senderEmailDomains') || [];
      if (!senderEmailDomains) throw new Error('Expected senderEmailDomains to be in the store');

      const senderEmailDomainsUpdated = senderEmailDomains?.filter(
        senderEmailDomain => senderEmailDomain?.getValue('id') !== senderEmailDomainRemovedId,
      );

      rootFields.setLinkedRecords(senderEmailDomainsUpdated, 'senderEmailDomains');
    },
  });

export default { commit };
