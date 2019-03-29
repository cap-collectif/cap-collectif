// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  RemoveArgumentVoteMutationVariables,
  RemoveArgumentVoteMutationResponse,
} from './__generated__/RemoveArgumentVoteMutation.graphql';

const mutation = graphql`
  mutation RemoveArgumentVoteMutation($input: RemoveArgumentVoteInput!) {
    removeArgumentVote(input: $input) {
      deletedVoteId
      contribution {
        id
        ...ArgumentVoteBox_argument
      }
    }
  }
`;

const commit = (
  variables: RemoveArgumentVoteMutationVariables,
): Promise<RemoveArgumentVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
