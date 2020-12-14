// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateDebateOpinionMutationVariables,
  UpdateDebateOpinionMutationResponse,
} from '~relay/UpdateDebateOpinionMutation.graphql';

const mutation = graphql`
  mutation UpdateDebateOpinionMutation($input: UpdateDebateOpinionInput!) {
    updateDebateOpinion(input: $input) {
      errorCode
      debateOpinion {
        ...DebateOpinion_opinion
      }
    }
  }
`;

const commit = (
  variables: UpdateDebateOpinionMutationVariables,
): Promise<UpdateDebateOpinionMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
