// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddArgumentVoteMutationVariables,
  AddArgumentVoteMutationResponse,
} from './__generated__/AddArgumentVoteMutation.graphql';

const mutation = graphql`
  mutation AddArgumentVoteMutation($input: AddArgumentVoteInput!) {
    addArgumentVote(input: $input) {
      voteEdge {
        cursor
        node {
          id
          related {
            ...ArgumentVoteBox_argument
          }
        }
      }
    }
  }
`;

const commit = (
  variables: AddArgumentVoteMutationVariables,
): Promise<AddArgumentVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
