// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateRegistrationFormCommunicationMutationVariables,
  UpdateRegistrationFormCommunicationMutationResponse,
} from '~relay/UpdateRegistrationFormCommunicationMutation.graphql';

const mutation = graphql`
  mutation UpdateRegistrationFormCommunicationMutation($input: UpdateRegistrationFormCommunicationInput!) {
    updateRegistrationFormCommunication(input: $input) {
      registrationForm {
        ...RegistrationFormCommunication_registrationForm
        isIndexationDone
      }
    }
  }
`;

const commit = (
  variables: UpdateRegistrationFormCommunicationMutationVariables,
): Promise<UpdateRegistrationFormCommunicationMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
