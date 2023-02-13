import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
    UpdateDebateOpinionMutationVariables,
    UpdateDebateOpinionMutationResponse, UpdateDebateOpinionMutation,
} from '@relay/UpdateDebateOpinionMutation.graphql';

const mutation = graphql`
  mutation UpdateDebateOpinionMutation($input: UpdateDebateOpinionInput!) {
    updateDebateOpinion(input: $input) {
      errorCode
      debateOpinion {
        ...DebateOpinion_debateOpinion
      }
    }
  }
`;

const commit = (
    variables: UpdateDebateOpinionMutationVariables,
): Promise<UpdateDebateOpinionMutationResponse> =>
    commitMutation<UpdateDebateOpinionMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };
