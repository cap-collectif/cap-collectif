import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
    AddDebateOpinionMutationVariables,
    AddDebateOpinionMutationResponse, AddDebateOpinionMutation,
} from '@relay/AddDebateOpinionMutation.graphql';

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
    commitMutation<AddDebateOpinionMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };
