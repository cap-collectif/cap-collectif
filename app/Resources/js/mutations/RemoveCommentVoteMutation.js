// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  RemoveCommentVoteMutationVariables,
  RemoveCommentVoteMutationResponse,
} from './__generated__/RemoveCommentVoteMutation.graphql';

const mutation = graphql`
  mutation RemoveCommentVoteMutation($input: RemoveCommentVoteInput!) {
    removeCommentVote(input: $input) {
      deletedVoteId
      contribution {
        ...CommentVoteButton_comment
      }
    }
  }
`;

const commit = (
  variables: RemoveCommentVoteMutationVariables,
  optimisticResponseVariables: Object,
): Promise<RemoveCommentVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    optimisticResponse: {
      removeCommentVote: {
        contribution: {
          id: variables.input.commentId,
          viewerHasVote: false,
          viewerVote: null,
          votes: { totalCount: optimisticResponseVariables.votesCount - 1 },
        },
      },
    },
  });

export default { commit };
