// @flow
import { commitMutation, graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import type {
  ChangeSelectionStatusMutationVariables,
  ChangeSelectionStatusMutationResponse,
} from './__generated__/ChangeSelectionStatusMutation.graphql';

const mutation = graphql`
  mutation ChangeSelectionStatusMutation($input: ChangeSelectionStatusInput!) {
    changeSelectionStatus(input: $input) {
      proposal {
        id
      }
    }
  }
`;

function commit(variables: ChangeSelectionStatusMutationVariables) {
  return commitMutation(environment, {
    mutation,
    variables,
    onCompleted: (response: ChangeSelectionStatusMutationResponse) => {
      console.log('Success!', response);
    },
    onError: err => console.error(err),
  });
}

export default { commit };
