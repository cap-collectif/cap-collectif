// @flow
import { commitMutation, graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import type {
  ChangeCollectStatusMutationVariables,
  ChangeCollectStatusMutationResponse,
} from './__generated__/ChangeCollectStatusMutation.graphql';

const mutation = graphql`
  mutation ChangeCollectStatusMutation($input: ChangeCollectStatusInput!) {
    changeCollectStatus(input: $input) {
      proposal {
        id
      }
    }
  }
`;

function commit(variables: ChangeCollectStatusMutationVariables) {
  return commitMutation(environment, {
    mutation,
    variables,
    onCompleted: (response: ChangeCollectStatusMutationResponse) => {
      console.log('Success!', response);
    },
    onError: err => console.error(err),
  });
}

export default { commit };
