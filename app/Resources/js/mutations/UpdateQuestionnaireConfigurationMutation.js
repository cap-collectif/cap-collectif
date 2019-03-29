// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateQuestionnaireConfigurationMutationVariables,
  UpdateQuestionnaireConfigurationMutationResponse,
} from './__generated__/UpdateQuestionnaireConfigurationMutation.graphql';

const mutation = graphql`
  mutation UpdateQuestionnaireConfigurationMutation(
    $input: UpdateQuestionnaireConfigurationInput!
  ) {
    updateQuestionnaireConfiguration(input: $input) {
      questionnaire {
        ...QuestionnaireAdminConfigurationForm_questionnaire
        ...QuestionnaireAdminResults_questionnaire
      }
    }
  }
`;

const commit = (
  variables: UpdateQuestionnaireConfigurationMutationVariables,
): Promise<UpdateQuestionnaireConfigurationMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
