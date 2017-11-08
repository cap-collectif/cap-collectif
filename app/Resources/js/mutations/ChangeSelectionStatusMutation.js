// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  ChangeSelectionStatusMutationVariables,
  ChangeSelectionStatusMutationResponse,
} from './__generated__/ChangeSelectionStatusMutation.graphql';

const mutation = graphql`
  mutation ChangeSelectionStatusMutation($input: ChangeSelectionStatusInput!) {
    changeSelectionStatus(input: $input) {
      proposal {
        id
        selections {
          step {
            id
          }
          status {
            id
          }
        }
      }
    }
  }
`;

const commit = (
  variables: ChangeSelectionStatusMutationVariables,
): Promise<ChangeSelectionStatusMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
