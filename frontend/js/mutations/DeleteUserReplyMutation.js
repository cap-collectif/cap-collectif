// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteUserReplyMutationVariables,
  DeleteUserReplyMutationResponse,
} from '~relay/DeleteUserReplyMutation.graphql';

const mutation = graphql`
  mutation DeleteUserReplyMutation($input: DeleteUserReplyInput!, $isAuthenticated: Boolean!) {
    deleteUserReply(input: $input) {
      questionnaire {
        id
        ...UserReplies_questionnaire @arguments(isAuthenticated: $isAuthenticated)
      }
    }
  }
`;

const commit = (
  variables: DeleteUserReplyMutationVariables,
): Promise<DeleteUserReplyMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
