// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  CreateUserMutationVariables,
  CreateUserMutationResponse,
} from '~relay/CreateUserMutation.graphql';

const mutation = graphql`
  mutation CreateUserMutation($input: CreateUserInput!) {
    createUser(input: $input) {
      user {
        adminUrl
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
