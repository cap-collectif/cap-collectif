// @flow
import { graphql } from 'react-relay';
import commitMutation from './commitMutation';
import environment from '../createRelayEnvironment';
import type {
  ChangeProposalEvaluationMutationVariables,
  ChangeProposalEvaluationMutationResponse,
} from './__generated__/ChangeProposalEvaluationMutation.graphql';

const mutation = graphql`
  mutation ChangeProposalEvaluationMutation($input: ChangeProposalEvaluationInput!) {
    changeProposalEvaluation(input: $input) {
      proposal {
        ...ProposalAdminNotationForm_proposal
      }
    }
  }
`;

const commit = (
  variables: ChangeProposalEvaluationMutationVariables,
): Promise<ChangeProposalEvaluationMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
