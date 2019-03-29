// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateUserAccountMutationVariables,
  UpdateUserAccountMutationResponse,
} from './__generated__/UpdateUserAccountMutation.graphql';

const mutation = graphql`
  mutation UpdateUserAccountMutation($input: UpdateUserAccountInput!) {
    updateUserAccount(input: $input) {
      user {
        id
        ...UserAdminAccount_user
      }
    }
  }
`;

const commit = (
  variables: UpdateUserAccountMutationVariables,
): Promise<UpdateUserAccountMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
