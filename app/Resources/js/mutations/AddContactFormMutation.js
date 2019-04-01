// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddContactFormMutationVariables,
  AddContactFormMutationResponse,
} from '~relay/AddContactFormMutation.graphql';

const mutation = graphql`
  mutation AddContactFormMutation($input: AddContactFormInput!) {
    addContactForm(input: $input) {
      contactForm {
        id
        ...ContactFormAdminForm_contactForm
      }
    }
  }
`;

const commit = (
  variables: AddContactFormMutationVariables,
): Promise<AddContactFormMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
