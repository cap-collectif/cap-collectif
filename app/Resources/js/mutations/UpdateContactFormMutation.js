// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateContactFormMutationVariables,
  UpdateContactFormMutationResponse,
} from '~relay/UpdateContactFormMutation.graphql';

const mutation = graphql`
  mutation UpdateContactFormMutation($input: UpdateContactFormInput!) {
    updateContactForm(input: $input) {
      contactForm {
        id
        ...ContactFormAdminForm_contactForm
      }
    }
  }
`;

const commit = (
  variables: UpdateContactFormMutationVariables,
): Promise<UpdateContactFormMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
