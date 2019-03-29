// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  CreateUserMutationVariables,
  CreateUserMutationResponse,
} from './__generated__/CreateUserMutation.graphql';

const mutation = graphql`
  mutation CreateUserMutation($input: CreateUserInput!) {
    createUser(input: $input) {
      user {
        id
      }
    }
  }
`;

const commit = (variables: CreateUserMutationVariables): Promise<CreateUserMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
