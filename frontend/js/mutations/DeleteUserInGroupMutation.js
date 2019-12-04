// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteUserInGroupMutationVariables,
  DeleteUserInGroupMutationResponse,
} from '~relay/DeleteUserInGroupMutation.graphql';

const mutation = graphql`
  mutation DeleteUserInGroupMutation($input: DeleteUserInGroupInput!) {
    deleteUserInGroup(input: $input) {
      group {
        id
        users {
          edges {
            node {
              id
            }
          }
        }
      }
    }
  }
`;

const commit = (
  variables: DeleteUserInGroupMutationVariables,
): Promise<DeleteUserInGroupMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
