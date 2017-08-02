import { commitMutation, graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import type { ChangeProposalPublicationStatusMutationVariables } from './__generated__/ChangeProposalContentMutation.graphql';

const mutation = graphql`
  mutation ChangeProposalPublicationStatusMutation(
    $input: ChangeProposalPublicationStatusInput!
  ) {
    changeProposalPublicationStatus(input: $input) {
      proposal {
        publicationStatus
      }
    }
  }
`;

// function getOptimisticResponse(publicationStatus) {
//   return {
//     changeProposalPublicationStatus: {
//       proposal: {
//         publicationStatus,
//       }
//     },
//   };
// }

function commit(variables: ChangeProposalPublicationStatusMutationVariables) {
  return commitMutation(environment, {
    mutation,
    variables,
    onCompleted: () => {
      console.log('Success!');
    },
    onError: err => console.error(err),
    // optimisticResponse: () => getOptimisticResponse(publicationStatus),
  });
}

export default { commit };
