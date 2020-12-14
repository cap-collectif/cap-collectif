// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteDebateOpinionMutationVariables,
  DeleteDebateOpinionMutationResponse,
} from '~relay/DeleteDebateOpinionMutation.graphql';

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
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
