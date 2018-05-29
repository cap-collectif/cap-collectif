// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateUserAccountMutationVariables,
  UpdateUserAccountMutationResponse,
} from './__generated__/UpdateUserAccountMutation.graphql';
export type UpdateUserAccountMutation = Response;

const mutation = graphql`
  mutation UpdateUserAccountMutation($input: UpdateUserAccountInput!) {
    updateUserAccount(input: $input) {
      user {
        id
      }
    }
  }
`;

const commit = (variables: UpdateUserAccountMutationVariables): Promise<Response> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
