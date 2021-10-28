// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddReplyMutationVariables,
  AddReplyMutationResponse,
} from '~relay/AddReplyMutation.graphql';

const mutation = graphql`
  mutation AddReplyMutation($input: AddReplyInput!, $isAuthenticated: Boolean!) {
    addReply(input: $input) {
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

const commit = (variables: AddReplyMutationVariables): Promise<AddReplyMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
