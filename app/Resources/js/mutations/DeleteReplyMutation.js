// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteReplyMutationVariables,
  DeleteReplyMutationResponse,
} from './__generated__/DeleteReplyMutation.graphql';

const mutation = graphql`
  mutation DeleteReplyMutation($input: DeleteReplyInput!) {
    deleteReply(input: $input) {
      questionnaire {
        id
        ...UserReplies_questionnaire
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
