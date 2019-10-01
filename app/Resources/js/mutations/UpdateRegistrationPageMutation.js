// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateRegistrationPageMutationVariables,
  UpdateRegistrationPageMutationResponse,
} from '~relay/UpdateRegistrationPageMutation.graphql';

const mutation = graphql`
  mutation UpdateRegistrationPageMutation($input: UpdateRegistrationPageInput!) {
    updateRegistrationPage(input: $input) {
      customcode
    }
  }
`;

const commit = (
  variables: UpdateRegistrationPageMutationVariables,
): Promise<UpdateRegistrationPageMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
