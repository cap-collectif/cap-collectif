// @flow
import { commitMutation, graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import type {
  UpdateSelectionStatusMutationVariables,
  UpdateSelectionStatusMutationResponse,
} from './__generated__/UpdateSelectionStatusMutation.graphql';

const mutation = graphql`
  mutation UpdateSelectionStatusMutation($input: UpdateSelectionStatusInput!) {
    updateSelectionStatus(input: $input) {
      status {
        id
      }
    }
  }
`;

function commit(variables: UpdateSelectionStatusMutationVariables) {
  return commitMutation(environment, {
    mutation,
    variables,
    onCompleted: (response: UpdateSelectionStatusMutationResponse) => {
      console.log('Success!', response);
    },
    onError: err => console.error(err),
  });
}

export default { commit };
