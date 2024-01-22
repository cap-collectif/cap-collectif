import { graphql } from 'react-relay';
import { RecordSourceSelectorProxy } from 'relay-runtime';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
  DeleteProposalFormMutation,
  DeleteProposalFormMutationResponse,
  DeleteProposalFormMutationVariables,
} from '@relay/DeleteProposalFormMutation.graphql';

const mutation = graphql`
    mutation DeleteProposalFormMutation($input: DeleteProposalFormInput!, $connections: [ID!]!)
    @raw_response_type
    {
        deleteProposalForm(input: $input) {
            deletedProposalFormId @deleteEdge(connections: $connections)
        }
    }
`;

const commit = (
  variables: DeleteProposalFormMutationVariables,
  isAdmin: boolean,
): Promise<DeleteProposalFormMutationResponse> =>
  commitMutation<DeleteProposalFormMutation>(environment, {
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

      const organization = viewer.getLinkedRecords('organizations')[0] ?? null;
      const owner = organization ?? viewer;

      const proposalForms = owner.getLinkedRecord('proposalForms', {
        affiliations: isAdmin ? null : ['OWNER'],
      });

      if (!proposalForms) return;

      const proposalFormsTotalCount = parseInt(String(proposalForms.getValue('totalCount')), 10);
      proposalForms.setValue(proposalFormsTotalCount - 1, 'totalCount');
    },
  });

export default { commit };
