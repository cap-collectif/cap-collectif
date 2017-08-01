import { commitMutation, graphql } from 'react-relay';

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

function commit(environment, publicationStatus, id) {
  return commitMutation(environment, {
    mutation,
    variables: {
      input: { publicationStatus, id },
    },
    onCompleted: () => {
      console.log('Success!');
    },
    onError: err => console.error(err),
    // optimisticResponse: () => getOptimisticResponse(publicationStatus),
  });
}

export default { commit };
