// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddSourceVoteMutationVariables,
  AddSourceVoteMutationResponse,
} from './__generated__/AddSourceVoteMutation.graphql';

const mutation = graphql`
  mutation AddSourceVoteMutation($input: AddSourceVoteInput!) {
    addSourceVote(input: $input) {
      voteEdge {
        cursor
        node {
          id
          related {
            ...OpinionSourceVoteBox_source
          }
        }
      }
    }
  }
`;

const commit = (
  variables: AddSourceVoteMutationVariables,
): Promise<AddSourceVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
