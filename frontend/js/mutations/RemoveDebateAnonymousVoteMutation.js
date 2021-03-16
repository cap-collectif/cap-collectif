// @flow
import { graphql } from 'react-relay';
import environment from '~/createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  RemoveDebateAnonymousVoteMutationVariables,
  RemoveDebateAnonymousVoteMutationResponse,
} from '~relay/RemoveDebateAnonymousVoteMutation.graphql';

const mutation = graphql`
  mutation RemoveDebateAnonymousVoteMutation($input: RemoveDebateAnonymousVoteInput!) {
    removeDebateAnonymousVote(input: $input) {
      errorCode
      deletedDebateAnonymousVoteId
    }
  }
`;

const commit = (
  variables: RemoveDebateAnonymousVoteMutationVariables,
): Promise<RemoveDebateAnonymousVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    optimisticResponse: {
      removeDebateAnonymousVote: {
        errorCode: null,
        deletedDebateAnonymousVoteId: new Date().toISOString(),
      },
    },
  });

export default { commit };
