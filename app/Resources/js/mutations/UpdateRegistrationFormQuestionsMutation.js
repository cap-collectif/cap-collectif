// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateRegistrationFormQuestionsMutationVariables,
  UpdateRegistrationFormQuestionsMutationResponse,
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
  variables: UpdateRegistrationFormQuestionsMutationVariables,
): Promise<UpdateRegistrationFormQuestionsMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
