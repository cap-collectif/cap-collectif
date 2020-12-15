// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  RemoveDebateArgumentVoteMutationVariables,
  RemoveDebateArgumentVoteMutationResponse,
} from '~relay/RemoveDebateArgumentVoteMutation.graphql';

const mutation = graphql`
  mutation RemoveDebateArgumentVoteMutation($input: RemoveDebateArgumentVoteInput!) {
    removeDebateArgumentVote(input: $input) {
      errorCode
      debateArgument {
        votes {
          edges {
            node {
              author {
                id
              }
            }
          }
          totalCount
        }
        viewerHasVote
      }
    }
  }
`;

const commit = (
  variables: RemoveDebateArgumentVoteMutationVariables,
): Promise<RemoveDebateArgumentVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
