// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddDebateArgumentVoteMutationVariables,
  AddDebateArgumentVoteMutationResponse,
} from '~relay/AddDebateArgumentVoteMutation.graphql';

const mutation = graphql`
  mutation AddDebateArgumentVoteMutation($input: AddDebateArgumentVoteInput!) {
    addDebateArgumentVote(input: $input) {
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
  variables: AddDebateArgumentVoteMutationVariables,
): Promise<AddDebateArgumentVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
