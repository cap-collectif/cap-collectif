// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateRegistrationFormQuestionsVariables,
  UpdateRegistrationFormQuestionsResponse,
} from '~relay/UpdateRegistrationFormQuestionsMutation.graphql';

const mutation = graphql`
  mutation UpdateRegistrationFormQuestionsMutation($input: UpdateRegistrationFormQuestionsInput!) {
    updateRegistrationForm(input: $input) {
      registrationForm {
        ...RegistrationFormQuestions_registrationForm
      }
    }
  }
`;

const commit = (
  variables: UpdateRegistrationFormQuestionsVariables,
): Promise<UpdateRegistrationFormQuestionsResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
