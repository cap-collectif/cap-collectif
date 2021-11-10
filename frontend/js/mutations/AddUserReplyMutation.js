// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddUserReplyMutationVariables,
  AddUserReplyMutationResponse,
} from '~relay/AddUserReplyMutation.graphql';

const mutation = graphql`
  mutation AddUserReplyMutation($input: AddUserReplyInput!, $isAuthenticated: Boolean!) {
    addUserReply(input: $input) {
      reply {
        id
        ...ReplyForm_reply
        questionnaire {
          id
          ...ReplyCreateFormWrapper_questionnaire @arguments(isAuthenticated: $isAuthenticated)
          ...UserReplies_questionnaire @arguments(isAuthenticated: $isAuthenticated)
        }
      }
      questionnaire {
        ...ReplyForm_questionnaire @arguments(isAuthenticated: $isAuthenticated)
      }
      errorCode
    }
  }
`;

const commit = (variables: AddUserReplyMutationVariables): Promise<AddUserReplyMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
