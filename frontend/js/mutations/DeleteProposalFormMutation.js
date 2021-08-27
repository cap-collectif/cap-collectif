// @flow
import { graphql } from 'react-relay';
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteProposalFormMutationResponse,
  DeleteProposalFormMutationVariables,
} from '~relay/DeleteProposalFormMutation.graphql';

const mutation = graphql`
  mutation DeleteProposalFormMutation($input: DeleteProposalFormInput!, $connections: [ID!]!) {
    deleteProposalForm(input: $input) {
      deletedProposalFormId @deleteEdge(connections: $connections)
    }
  }
`;

const commit = (
  variables: DeleteProposalFormMutationVariables,
  isAdmin: boolean,
): Promise<DeleteProposalFormMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    optimisticResponse: {
      deleteProposalForm: {
        deletedProposalFormId: variables.input.id,
      },
    },
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('deleteProposalForm');
      if (!payload) return;
      const errorCode = payload.getValue('errorCode');
      if (errorCode) return;

      const rootFields = store.getRoot();
      const viewer = rootFields.getLinkedRecord('viewer');
      if (!viewer) return;
      const proposalForms = viewer.getLinkedRecord('proposalForms', {
        affiliations: isAdmin ? null : ['OWNER'],
      });
      if (!proposalForms) return;

      const proposalFormsTotalCount = parseInt(proposalForms.getValue('totalCount'), 10);
      proposalForms.setValue(proposalFormsTotalCount - 1, 'totalCount');
    },
  });

export default { commit };
