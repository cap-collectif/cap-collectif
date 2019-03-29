// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  ChangeProposalFormParametersMutationResponse,
  ChangeProposalFormParametersMutationVariables,
} from '~relay/ChangeProposalFormParametersMutation.graphql';

const mutation = graphql`
  mutation ChangeProposalFormParametersMutation($input: UpdateProposalFormInput!) {
    updateProposalForm(input: $input) {
      proposalForm {
        ...ProposalFormAdminSettingsForm_proposalForm
      }
    }
  }
`;

const commit = (
  variables: ChangeProposalFormParametersMutationVariables,
): Promise<ChangeProposalFormParametersMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
