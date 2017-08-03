// @flow
import { commitMutation, graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import type {
  ChangeProposalContentMutationVariables,
  ChangeProposalContentMutationResponse,
} from './__generated__/ChangeProposalContentMutation.graphql';

const mutation = graphql`
  mutation ChangeProposalContentMutation($input: ChangeProposalContentInput!) {
    changeProposalContent(input: $input) {
      proposal {
        publicationStatus
      }
    }
  }
`;

function commit(
  variables: ChangeProposalContentMutationVariables,
  uploadables: any = undefined,
) {
  return commitMutation(environment, {
    mutation,
    uploadables,
    variables,
    onCompleted: (response: ChangeProposalContentMutationResponse) => {
      console.log('Success!', response);
    },
    onError: err => console.error(err),
  });
}

export default { commit };
