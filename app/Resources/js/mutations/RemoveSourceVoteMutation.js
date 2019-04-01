// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  RemoveSourceVoteMutationVariables,
  RemoveSourceVoteMutationResponse,
} from '~relay/RemoveSourceVoteMutation.graphql';

const mutation = graphql`
  mutation RemoveSourceVoteMutation($input: RemoveSourceVoteInput!) {
    removeSourceVote(input: $input) {
      deletedVoteId
      contribution {
        ...OpinionSourceVoteBox_source
      }
    }
  }
`;

const commit = (
  variables: RemoveSourceVoteMutationVariables,
): Promise<RemoveSourceVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
