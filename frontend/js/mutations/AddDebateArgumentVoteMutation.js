// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddDebateArgumentVoteMutationVariables,
  AddDebateArgumentVoteMutationResponse,
} from '~relay/AddDebateArgumentVoteMutation.graphql';

type OptimisticVariables = {|
  +countVotes: number,
|};

const mutation = graphql`
  mutation AddDebateArgumentVoteMutation($input: AddDebateArgumentVoteInput!) {
    addDebateArgumentVote(input: $input) {
      errorCode
      debateArgument {
        id
        viewerHasVote
        votes(first: 0) {
          totalCount
        }
      }
    }
  }
`;

const commit = (
  variables: AddDebateArgumentVoteMutationVariables,
  optimisticVariables: OptimisticVariables,
): Promise<AddDebateArgumentVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    optimisticResponse: {
      addDebateArgumentVote: {
        errorCode: null,
        debateArgument: {
          __typename: 'DebateArgument',
          id: variables.input.debateArgumentId,
          viewerHasVote: true,
          votes: {
            totalCount: optimisticVariables.countVotes + 1,
          },
        },
      },
    },
  });

export default { commit };
