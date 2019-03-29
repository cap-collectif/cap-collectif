// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateGroupMutationVariables,
  UpdateGroupMutationResponse,
} from './__generated__/UpdateGroupMutation.graphql';

const mutation = graphql`
  mutation UpdateGroupMutation($input: UpdateGroupInput!) {
    updateGroup(input: $input) {
      group {
        id
      }
    }
  }
`;

const commit = (variables: UpdateGroupMutationVariables): Promise<UpdateGroupMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
