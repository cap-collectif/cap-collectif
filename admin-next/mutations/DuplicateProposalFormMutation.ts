import { graphql } from 'react-relay';
import { IntlShape } from 'react-intl';
import { environment } from 'utils/relay-environement';
import type {
  DuplicateProposalFormMutation,
  DuplicateProposalFormMutationResponse,
  DuplicateProposalFormMutationVariables,
} from '@relay/DuplicateProposalFormMutation.graphql';
import type { ProposalFormItem_proposalForm } from '@relay/ProposalFormItem_proposalForm.graphql';
import commitMutation from './commitMutation';
import {Viewer} from '../components/ProposalForm/ProposalFormItem'

const mutation = graphql`
    mutation DuplicateProposalFormMutation(
        $input: DuplicateProposalFormInput!
        $connections: [ID!]!
    ) @raw_response_type {
        duplicateProposalForm(input: $input) {
            error
            duplicatedProposalForm
            @prependNode(connections: $connections, edgeTypeName: "ProposalFormEdge") {
                ...ProposalFormItem_proposalForm
            }
        }
    }
`;

const commit = (
  variables: DuplicateProposalFormMutationVariables,
  proposalFormDuplicated: ProposalFormItem_proposalForm,
  owner: Viewer,
  intl: IntlShape,
): Promise<DuplicateProposalFormMutationResponse> =>
  commitMutation<DuplicateProposalFormMutation>(environment, {
    mutation,
    variables,
    optimisticResponse: {
      duplicateProposalForm: {
        error: null,
        duplicatedProposalForm: {
          id: new Date().toISOString(),
          title: `${intl.formatMessage({ id: 'copy-of' })} ${proposalFormDuplicated.title}`,
          adminUrl: '',
          createdAt: new Date().toString(),
          updatedAt: new Date().toString(),
          step: null,
          owner
        },
      },
    },
  });

export default { commit };
