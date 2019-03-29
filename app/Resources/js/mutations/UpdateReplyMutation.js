// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateReplyMutationVariables,
  UpdateReplyMutationResponse,
} from '~relay/UpdateReplyMutation.graphql';

const mutation = graphql`
  mutation UpdateReplyMutation($input: UpdateReplyInput!) {
    updateReply(input: $input) {
      reply {
        id
        ...ReplyModalLink_reply
      }
    }
  }
`;

const commit = (variables: UpdateReplyMutationVariables): Promise<UpdateReplyMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
