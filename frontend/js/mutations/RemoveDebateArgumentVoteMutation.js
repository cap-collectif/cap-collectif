// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  RemoveDebateArgumentVoteMutationVariables,
  RemoveDebateArgumentVoteMutationResponse,
} from '~relay/RemoveDebateArgumentVoteMutation.graphql';

type OptimisticVariables = {|
  +countVotes: number,
|};

const mutation = graphql`
  mutation RemoveDebateArgumentVoteMutation($input: RemoveDebateArgumentVoteInput!) {
    removeDebateArgumentVote(input: $input) {
      errorCode
      debateArgument {
        viewerHasVote
        votes(first: 0) {
          totalCount
        }
      }
    }
  }
`;

const commit = (
  variables: RemoveDebateArgumentVoteMutationVariables,
  optimisticVariables: OptimisticVariables,
): Promise<RemoveDebateArgumentVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    optimisticResponse: {
      removeDebateArgumentVote: {
        errorCode: null,
        debateArgument: {
          id: variables.input.debateArgumentId,
          viewerHasVote: false,
          votes: {
            totalCount: optimisticVariables.countVotes - 1,
          },
        },
      },
    },
  });

export default { commit };
