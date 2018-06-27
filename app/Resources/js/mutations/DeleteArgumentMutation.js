// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteArgumentMutationVariables,
  DeleteArgumentMutationResponse,
} from './__generated__/DeleteArgumentMutation.graphql';

const mutation = graphql`
  mutation DeleteArgumentMutation($input: DeleteArgumentInput!) {
    deleteArgument(input: $input) {
      argumentable {
        id
      }
    }
  }
`;

const commit = (
  variables: DeleteArgumentMutationVariables,
): Promise<DeleteArgumentMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
