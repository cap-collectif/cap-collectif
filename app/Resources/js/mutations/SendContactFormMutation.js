// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  SendContactFormMutationVariables,
  SendContactFormMutationResponse,
} from './__generated__/SetEvaluationFormInProposalFormMutation.graphql';

const mutation = graphql`
  mutation SendContactFormMutation($input: SendContactFormInput!) {
    sendContactForm(input: $input) {
      contactForm {
        id
        title
        email
        body
      }
    }
  }
`;

const commit = (
  variables: SendContactFormMutationVariables,
): Promise<SendContactFormMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
