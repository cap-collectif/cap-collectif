// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateProposalFormMutationVariables,
  UpdateProposalFormMutationResponse,
} from './__generated__/UpdateProposalFormMutation.graphql';

const mutation = graphql`
  mutation UpdateProposalFormMutation($input: UpdateProposalFormInput!) {
    updateProposalForm(input: $input) {
      proposalForm {
        ...ProposalFormAdminConfigurationForm_proposalForm
      }
    }
  }
`;

const commit = (
  variables: UpdateProposalFormMutationVariables,
): Promise<UpdateProposalFormMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
