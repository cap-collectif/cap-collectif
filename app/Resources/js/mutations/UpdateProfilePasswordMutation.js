// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateProfilePasswordMutationVariables,
  UpdateProfilePasswordMutationResponse as Response,
} from './__generated__/UpdateProfilePasswordMutation.graphql';

export type UpdateProfilePasswordMutationResponse = Response;

const mutation = graphql`
  mutation UpdateProfilePasswordMutation($input: UpdateProfilePasswordInput!) {
    updateProfilePassword(input: $input) {
      user {
        id
        username
        ...UserAdminPassword_user
      }
      error
    }
  }
`;

const commit = (variables: UpdateProfilePasswordMutationVariables): Promise<Response> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
