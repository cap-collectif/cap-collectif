// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteDebateArgumentMutationVariables,
  DeleteDebateArgumentMutationResponse,
} from '~relay/DeleteDebateArgumentMutation.graphql';

const mutation = graphql`
  mutation DeleteDebateArgumentMutation($input: DeleteDebateArgumentInput!, $connections: [ID!]!) {
    deleteDebateArgument(input: $input) {
      errorCode
      deletedDebateArgumentId @deleteEdge(connections: $connections)
    }
  }
`;

const commit = (
  variables: DeleteDebateArgumentMutationVariables,
): Promise<DeleteDebateArgumentMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
