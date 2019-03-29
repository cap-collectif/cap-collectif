// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  CreateProposalFormMutationResponse,
  CreateProposalFormMutationVariables,
} from './__generated__/CreateProposalFormMutation.graphql';

const mutation = graphql`
  mutation CreateProposalFormMutation($input: CreateProposalFormInput!) {
    createProposalForm(input: $input) {
      proposalForm {
        id
      }
    }
  }
`;

const commit = (
  variables: CreateProposalFormMutationVariables,
): Promise<CreateProposalFormMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
