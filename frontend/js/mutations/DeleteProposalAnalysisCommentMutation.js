// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteProposalAnalysisCommentMutationVariables,
  DeleteProposalAnalysisCommentMutationResponse,
} from '~relay/DeleteProposalAnalysisCommentMutation.graphql';

const mutation = graphql`
  mutation DeleteProposalAnalysisCommentMutation($input: DeleteCommentInput!, $connections: [ID!]!) {
    deleteComment(input: $input) {
      deletedCommentId @deleteEdge(connections: $connections)
    }
  }
`;

const commit = (
  variables: DeleteProposalAnalysisCommentMutationVariables,
): Promise<DeleteProposalAnalysisCommentMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
