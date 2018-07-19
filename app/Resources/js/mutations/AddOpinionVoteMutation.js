// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddOpinionVoteMutationVariables,
  AddOpinionVoteMutationResponse,
} from './__generated__/AddOpinionVoteMutation.graphql';

const mutation = graphql`
  mutation AddOpinionVoteMutation($input: AddOpinionVoteInput!) {
    addOpinionVote(input: $input) {
      vote {
        id
        related {
          id
        }
      }
      viewer {
        id
      }
    }
  }
`;

const commit = (
  variables: AddOpinionVoteMutationVariables,
): Promise<AddOpinionVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
