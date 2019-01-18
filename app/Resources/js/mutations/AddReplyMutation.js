// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddReplyMutationVariables,
  AddReplyMutationResponse,
} from './__generated__/AddReplyMutation.graphql';

const mutation = graphql`
  mutation AddReplyMutation($input: AddReplyInput!) {
    addReply(input: $input) {
      reply {
        id
        questionnaire {
          id
          ...ReplyCreateFormWrapper_questionnaire
          ...UserReplies_questionnaire
        }
      }
    }
  }
`;

const commit = (variables: AddReplyMutationVariables): Promise<AddReplyMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
