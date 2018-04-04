// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddUsersInGroupMutationVariables,
  AddUsersInGroupMutationResponse,
} from './__generated__/AddUsersInGroupMutation.graphql';

const mutation = graphql`
  mutation AddUsersInGroupMutation($input: AddUsersInGroupInput!) {
    addUsersInGroup(input: $input) {
      group {
        id
        users {
          edges {
            node {
              ...GroupAdminUsersListGroupItem_user
            }
          }
        }
      }
    }
  }
`;

const commit = (
  variables: AddUsersInGroupMutationVariables,
): Promise<AddUsersInGroupMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
