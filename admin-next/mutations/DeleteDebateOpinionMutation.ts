import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
    DeleteDebateOpinionMutation,
    DeleteDebateOpinionMutationVariables,
    DeleteDebateOpinionMutationResponse,
} from '@relay/DeleteDebateOpinionMutation.graphql';

const mutation = graphql`
  mutation DeleteDebateOpinionMutation($input: DeleteDebateOpinionInput!, $connections: [ID!]!) {
    deleteDebateOpinion(input: $input) {
      errorCode
      deletedDebateOpinionId @deleteEdge(connections: $connections)
    }
  }
`;

const commit = (
    variables: DeleteDebateOpinionMutationVariables,
): Promise<DeleteDebateOpinionMutationResponse> =>
    commitMutation<DeleteDebateOpinionMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };
