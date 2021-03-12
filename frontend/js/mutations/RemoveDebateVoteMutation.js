// @flow
import { graphql } from 'react-relay';
import environment from '~/createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  RemoveDebateVoteMutationVariables,
  RemoveDebateVoteMutationResponse,
} from '~relay/RemoveDebateVoteMutation.graphql';

const mutation = graphql`
  mutation RemoveDebateVoteMutation($input: RemoveDebateVoteInput!, $connections: [ID!]!) {
    removeDebateVote(input: $input) {
      errorCode
      deletedVoteId
      deletedArgumentId @deleteEdge(connections: $connections)
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
  variables: RemoveDebateVoteMutationVariables,
): Promise<RemoveDebateVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
