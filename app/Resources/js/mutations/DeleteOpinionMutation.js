// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteOpinionMutationVariables,
  DeleteOpinionMutationResponse,
} from '~relay/DeleteOpinionMutation.graphql';

const mutation = graphql`
  mutation DeleteOpinionMutation($input: DeleteOpinionInput!) {
    deleteOpinion(input: $input) {
      deletedOpinionId
    }
  }
`;

const commit = (
  variables: DeleteOpinionMutationVariables,
): Promise<DeleteOpinionMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
