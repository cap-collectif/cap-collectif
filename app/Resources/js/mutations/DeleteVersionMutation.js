// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteVersionMutationVariables,
  DeleteVersionMutationResponse,
} from './__generated__/DeleteVersionMutation.graphql';

const mutation = graphql`
  mutation DeleteVersionMutation($input: DeleteVersionInput!) {
    deleteVersion(input: $input) {
      opinion {
        id
      }
      deletedVersionId
    }
  }
`;

const commit = (
  variables: DeleteVersionMutationVariables,
): Promise<DeleteVersionMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
