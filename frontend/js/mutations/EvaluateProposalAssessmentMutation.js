// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  EvaluateProposalAssessmentMutationVariables,
  EvaluateProposalAssessmentMutationResponse,
} from '~relay/EvaluateProposalAssessmentMutation.graphql';

const mutation = graphql`
  mutation EvaluateProposalAssessmentMutation($input: EvaluateProposalAssessmentInput!) {
    evaluateProposalAssessment(input: $input) {
      errorCode
      assessment {
        id
        body
        estimatedCost
        officialResponse
        state
        updatedBy {
          id
        }
      }
    }
  }
`;

const commit = (
  variables: EvaluateProposalAssessmentMutationVariables,
): Promise<EvaluateProposalAssessmentMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
