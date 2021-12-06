// @flow
import { graphql } from 'react-relay';
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  CreateProposalFormMutationResponse,
  CreateProposalFormMutationVariables,
} from '~relay/CreateProposalFormMutation.graphql';
import { type Viewer } from '~/components/Admin/Project/ProposalFormList/ProposalFormListPage';

const mutation = graphql`
  mutation CreateProposalFormMutation($input: CreateProposalFormInput!, $connections: [ID!]!) {
    createProposalForm(input: $input) {
      proposalForm @prependNode(connections: $connections, edgeTypeName: "ProposalFormEdge") {
        ...ProposalFormItem_proposalForm
        adminUrl
      }
    }
  }
`;

const commit = (
  variables: CreateProposalFormMutationVariables,
  isAdmin: boolean,
  owner: Viewer,
  hasProposalForm: boolean,
): Promise<CreateProposalFormMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    optimisticResponse: {
      createProposalForm: {
        proposalForm: {
          id: new Date().toISOString(),
          title: variables.input.title,
          createdAt: new Date(),
          updatedAt: new Date(),
          step: null,
          adminUrl: '',
          owner,
        },
      },
    },
    updater: (store: RecordSourceSelectorProxy) => {
      if (!hasProposalForm) return;
      const payload = store.getRootField('createProposalForm');
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
      proposalForms.setValue(proposalFormsTotalCount + 1, 'totalCount');
    },
  });

export default { commit };
