// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteCommentMutationVariables,
  DeleteCommentMutationResponse,
} from './__generated__/DeleteCommentMutation.graphql';

const mutation = graphql`
  mutation DeleteCommentMutation($input: DeleteCommentInput!) {
    deleteComment(input: $input) {
      commentable {
        id
      }
      deletedCommentId
    }
  }
`;

const commit = (
  variables: DeleteCommentMutationVariables,
): Promise<DeleteCommentMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
