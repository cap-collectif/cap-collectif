// @flow
import { graphql } from 'react-relay';
import environment from '~/createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddDebateVoteMutationVariables,
  AddDebateVoteMutationResponse,
} from '~relay/AddDebateVoteMutation.graphql';

export type OptimisticResponse = {|
  +yesVotes: number,
  +votes: number,
  +viewerConfirmed: boolean,
|};

const mutation = graphql`
  mutation AddDebateVoteMutation($input: AddDebateVoteInput!) {
    addDebateVote(input: $input) {
      errorCode
      debateVote {
        id
        type
        published
        debate {
          id
          viewerHasArgument
          viewerHasVote
          viewerVote {
            type
          }
          yesVotes: votes(isPublished: true, type: FOR, first: 0) {
            totalCount
          }
          votes(isPublished: true, first: 0) {
            totalCount
          }
        }
      }
    }
  }
`;

const commit = (
  variables: AddDebateVoteMutationVariables,
  optimisticResponse?: OptimisticResponse,
): Promise<AddDebateVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    optimisticResponse: optimisticResponse
      ? {
          addDebateVote: {
            errorCode: null,
            debateVote: {
              id: new Date().toISOString(),
              type: variables.input.type,
              published: optimisticResponse.viewerConfirmed,
              debate: {
                id: variables.input.debateId,
                viewerHasArgument: false,
                viewerHasVote: true,
                viewerVote: {
                  id: new Date().toISOString(),
                  type: variables.input.type,
                },
                yesVotes: {
                  totalCount:
                    variables.input.type === 'FOR' && optimisticResponse.viewerConfirmed
                      ? optimisticResponse.yesVotes + 1
                      : optimisticResponse.yesVotes,
                },
                votes: {
                  totalCount: optimisticResponse.viewerConfirmed
                    ? optimisticResponse.votes + 1
                    : optimisticResponse.votes,
                },
              },
            },
          },
        }
      : null,
  });

export default { commit };
