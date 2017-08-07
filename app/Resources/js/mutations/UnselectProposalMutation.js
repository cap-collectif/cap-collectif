// @flow
import { commitMutation, graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import type {
  UnselectProposalMutationVariables,
  UnselectProposalMutationResponse,
} from './__generated__/UnselectProposalMutation.graphql';

const mutation = graphql`
  mutation UnselectProposalMutation($input: UnselectProposalInput!) {
    unselectProposal(input: $input) {
      proposal {
        id
      }
    }
  }
`;

function commit(variables: UnselectProposalMutationVariables) {
  return commitMutation(environment, {
    mutation,
    variables,
    onCompleted: (response: UnselectProposalMutationResponse) => {
      console.log('Success!', response);
    },
    onError: err => console.error(err),
  });
}

export default { commit };
