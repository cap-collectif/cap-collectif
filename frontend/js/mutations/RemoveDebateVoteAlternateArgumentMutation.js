// @flow
import { graphql } from 'react-relay';
import environment from '~/createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  RemoveDebateVoteAlternateArgumentMutationVariables,
  RemoveDebateVoteAlternateArgumentMutationResponse,
} from '~relay/RemoveDebateVoteAlternateArgumentMutation.graphql';

const mutation = graphql`
  mutation RemoveDebateVoteAlternateArgumentMutation($input: RemoveDebateVoteInput!) {
    removeDebateVote(input: $input) {
      errorCode
      deletedVoteId
      deletedArgumentId @deleteRecord
      debate {
        yesVotes: votes(isPublished: true, type: FOR, first: 0) {
          totalCount
        }
        votes(isPublished: true, first: 0) {
          totalCount
        }
        viewerHasArgument
        viewerHasVote
        viewerVote {
          type
        }
        arguments(first: 0, isPublished: true, isTrashed: false) {
          totalCount
        }
      }
    }
  }
`;

const commit = (
  variables: RemoveDebateVoteAlternateArgumentMutationVariables,
): Promise<RemoveDebateVoteAlternateArgumentMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
