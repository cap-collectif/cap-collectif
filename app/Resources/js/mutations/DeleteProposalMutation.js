// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteProposalMutationVariables,
  DeleteProposalMutationResponse,
} from './__generated__/DeleteProposalMutation.graphql';

const mutation = graphql`
  mutation DeleteProposalMutation($input: DeleteProposalInput!) {
    deleteProposal(input: $input) {
      proposal {
        id
        publicationStatus
        trashedReason
        deletedAt
      }
      step {
        url
      }
    }
  }
`;

const commit = (
  variables: DeleteProposalMutationVariables,
): Promise<DeleteProposalMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    // updater to delete from connection
  });

export default { commit };
