// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteReplyMutationVariables,
  DeleteReplyMutationResponse,
} from '~relay/DeleteReplyMutation.graphql';

const mutation = graphql`
  mutation DeleteReplyMutation($input: DeleteReplyInput!, $isAuthenticated: Boolean!) {
    deleteReply(input: $input) {
      questionnaire {
        id
        ...UserReplies_questionnaire @arguments(isAuthenticated: $isAuthenticated)
      }
    }
  }
`;

const commit = (variables: DeleteReplyMutationVariables): Promise<DeleteReplyMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
