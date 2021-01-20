// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteProposalNewsMutationVariables,
  DeleteProposalNewsMutationResponse,
} from '~relay/DeleteProposalNewsMutation.graphql';

const mutation = graphql`
  mutation DeleteProposalNewsMutation($input: DeleteProposalNewsInput!) {
    deleteProposalNews(input: $input) {
      postId @deleteRecord
      errorCode
    }
  }
`;

const commit = (
  variables: DeleteProposalNewsMutationVariables,
): Promise<DeleteProposalNewsMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    optimisticUpdater: store => {
      store.delete(variables.input.postId);
    },
  });

export default { commit };
