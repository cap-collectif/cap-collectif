// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteGroupMutationVariables,
  DeleteGroupMutationResponse,
} from './__generated__/DeleteGroupMutation.graphql';

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
