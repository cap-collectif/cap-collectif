// @flow
import { commitMutation, graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import type {
  SelectProposalMutationVariables,
  SelectProposalMutationResponse,
} from './__generated__/SelectProposalMutation.graphql';

const mutation = graphql`
  mutation SelectProposalMutation($input: SelectProposalInput!) {
    selectProposal(input: $input) {
      proposal {
        id
      }
    }
  }
`;

function commit(variables: SelectProposalMutationVariables) {
  return commitMutation(environment, {
    mutation,
    variables,
    onCompleted: (response: SelectProposalMutationResponse) => {
      console.log('Success!', response);
    },
    onError: err => console.error(err),
  });
}

export default { commit };
