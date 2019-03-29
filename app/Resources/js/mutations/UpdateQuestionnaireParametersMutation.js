// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateQuestionnaireParametersMutationVariables,
  UpdateQuestionnaireParametersMutationResponse,
} from './__generated__/UpdateQuestionnaireParametersMutation.graphql';

const mutation = graphql`
  mutation UpdateQuestionnaireParametersMutation($input: UpdateQuestionnaireParametersInput!) {
    updateQuestionnaireParameters(input: $input) {
      questionnaire {
        ...QuestionnaireAdminParametersForm_questionnaire
      }
    }
  }
`;

const commit = (
  variables: UpdateQuestionnaireParametersMutationVariables,
): Promise<UpdateQuestionnaireParametersMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
