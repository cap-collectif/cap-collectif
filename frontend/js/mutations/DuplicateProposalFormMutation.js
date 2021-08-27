// @flow
import { graphql } from 'react-relay';
import type { IntlShape } from 'react-intl';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DuplicateProposalFormMutationResponse,
  DuplicateProposalFormMutationVariables,
} from '~relay/DuplicateProposalFormMutation.graphql';
import type { ProposalFormItem_proposalForm } from '~relay/ProposalFormItem_proposalForm.graphql';

const mutation = graphql`
  mutation DuplicateProposalFormMutation(
    $input: DuplicateProposalFormInput!
    $connections: [ID!]!
  ) {
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
  intl: IntlShape,
): Promise<DuplicateProposalFormMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    optimisticResponse: {
      duplicateProposalForm: {
        error: null,
        duplicatedProposalForm: {
          id: new Date().toISOString(),
          title: `${intl.formatMessage({ id: 'copy-of' })} ${proposalFormDuplicated.title}`,
          adminUrl: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          step: null,
        },
      },
    },
  });

export default { commit };
