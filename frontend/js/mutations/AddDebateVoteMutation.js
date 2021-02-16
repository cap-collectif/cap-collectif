// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddDebateVoteMutationVariables,
  AddDebateVoteMutationResponse,
} from '~relay/AddDebateVoteMutation.graphql';

const mutation = graphql`
  mutation AddDebateVoteMutation($input: AddDebateVoteInput!, $isAuthenticated: Boolean!) {
    addDebateVote(input: $input) {
      errorCode
      previousVoteId
      debateVote {
        id
        published
        publishedAt
        publishableUntil
        notPublishedReason
        debate {
          id
          viewerHasArgument @include(if: $isAuthenticated)
          viewerHasVote @include(if: $isAuthenticated)
          yesVotes: votes(type: FOR) {
            totalCount
          }
          votes {
            totalCount
          }
        }
        type
        createdAt
        author {
          id
        }
      }
    }
  }
`;

const commit = (
  variables: AddDebateVoteMutationVariables,
): Promise<AddDebateVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
