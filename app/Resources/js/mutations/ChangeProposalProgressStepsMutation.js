// @flow
import { commitMutation, graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import type {
  ChangeProposalProgressStepsMutationVariables,
  ChangeProposalProgressStepsMutationResponse,
} from './__generated__/ChangeProposalProgressStepsMutation.graphql';

const mutation = graphql`
  mutation ChangeProposalProgressStepsMutation(
    $input: ChangeProposalProgressStepsInput!
  ) {
    changeProposalProgressSteps(input: $input) {
      proposal {
        id
      }
    }
  }
`;

function commit(variables: ChangeProposalProgressStepsMutationVariables) {
  return commitMutation(environment, {
    mutation,
    variables,
    onCompleted: (response: ChangeProposalProgressStepsMutationResponse) => {
      console.log('Success!', response);
    },
    onError: err => console.error(err),
  });
}

export default { commit };
