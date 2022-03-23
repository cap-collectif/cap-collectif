// @flow
import { graphql } from 'react-relay';
import type {
  UpdatePaperVoteMutationResponse,
  UpdatePaperVoteMutationVariables,
} from '~relay/UpdatePaperVoteMutation.graphql';
import commitMutation from '~/mutations/commitMutation';
import environment from '~/createRelayEnvironment';

const mutation = graphql`
  mutation UpdatePaperVoteMutation($input: UpdatePaperVoteInput!) {
    updatePaperVote(input: $input) {
      proposal {
        id
      }
      error
    }
  }
`;

const commit = (
  variables: UpdatePaperVoteMutationVariables,
): Promise<UpdatePaperVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
