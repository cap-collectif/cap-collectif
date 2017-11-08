// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  SetEvaluationFormInProposalFormMutationVariables,
  SetEvaluationFormInProposalFormMutationResponse,
} from './__generated__/SetEvaluationFormInProposalFormMutation.graphql';

const mutation = graphql`
  mutation SetEvaluationFormInProposalFormMutation($input: SetEvaluationFormInProposalFormInput!) {
    setEvaluationFormInProposalForm(input: $input) {
      proposalForm {
        id
        evaluationForm {
          id
          title
        }
      }
    }
  }
`;

const commit = (
  variables: SetEvaluationFormInProposalFormMutationVariables,
): Promise<SetEvaluationFormInProposalFormMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
