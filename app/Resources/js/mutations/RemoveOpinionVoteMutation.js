// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  RemoveOpinionVoteMutationVariables,
  RemoveOpinionVoteMutationResponse,
} from './__generated__/RemoveOpinionVoteMutation.graphql';

const mutation = graphql`
  mutation RemoveOpinionVoteMutation($input: RemoveOpinionVoteInput!) {
    removeOpinionVote(input: $input) {
      contribution {
        id
      }
      viewer {
        id
      }
    }
  }
`;

const commit = (
  variables: RemoveOpinionVoteMutationVariables,
): Promise<RemoveOpinionVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
