// @flow
import { commitMutation, graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import type {
  ChangeProposalNotationMutationVariables,
  ChangeProposalNotationMutationResponse,
} from './__generated__/ChangeProposalNotationMutation.graphql';

const mutation = graphql`
  mutation ChangeProposalNotationMutation(
    $input: ChangeProposalNotationInput!
  ) {
    changeProposalNotation(input: $input) {
      proposal {
        publicationStatus
      }
    }
  }
`;

function commit(variables: ChangeProposalNotationMutationVariables) {
  return commitMutation(environment, {
    mutation,
    variables,
    onCompleted: (response: ChangeProposalNotationMutationResponse) => {
      console.log('Success!', response);
    },
    onError: err => console.error(err),
  });
}

export default { commit };
