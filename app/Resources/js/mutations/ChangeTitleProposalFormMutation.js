// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  ChangeTitleProposalFormMutationResponse,
  ChangeTitleProposalFormMutationVariables,
} from './__generated__/ChangeTitleProposalFormMutation.graphql';

const mutation = graphql`
  mutation ChangeTitleProposalFormMutation($input: ChangeTitleProposalFormInput!) {
    changeTitleProposalForm(input: $input) {
      proposalForm {
        id
        title
      }
    }
  }
`;

const commit = (
  variables: ChangeTitleProposalFormMutationVariables,
): Promise<ChangeTitleProposalFormMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
