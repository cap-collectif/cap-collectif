// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddDebateOpinionMutationVariables,
  AddDebateOpinionMutationResponse,
} from '~relay/AddDebateOpinionMutation.graphql';

const mutation = graphql`
  mutation AddDebateOpinionMutation(
    $input: AddDebateOpinionInput!
    $connections: [ID!]!
    $edgeTypeName: String!
  ) {
    addDebateOpinion(input: $input) {
      errorCode
      debateOpinion @appendNode(connections: $connections, edgeTypeName: $edgeTypeName) {
        ...DebateOpinion_debateOpinion
      }
    }
  }
`;

const commit = (
  variables: AddDebateOpinionMutationVariables,
): Promise<AddDebateOpinionMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
