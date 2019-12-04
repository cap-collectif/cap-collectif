// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteGroupMutationVariables,
  DeleteGroupMutationResponse,
} from '~relay/DeleteGroupMutation.graphql';

const mutation = graphql`
  mutation DeleteGroupMutation($input: DeleteGroupInput!) {
    deleteGroup(input: $input) {
      deletedGroupTitle
    }
  }
`;

const commit = (variables: DeleteGroupMutationVariables): Promise<DeleteGroupMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
