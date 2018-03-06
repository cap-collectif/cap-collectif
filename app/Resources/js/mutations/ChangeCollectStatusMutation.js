// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  ChangeCollectStatusMutationVariables,
  ChangeCollectStatusMutationResponse,
} from './__generated__/ChangeCollectStatusMutation.graphql';

const mutation = graphql`
  mutation ChangeCollectStatusMutation($input: ChangeCollectStatusInput!) {
    changeCollectStatus(input: $input) {
      proposal {
        id
        status {
          id
        }
      }
    }
  }
`;

const commit = (
  variables: ChangeCollectStatusMutationVariables,
): Promise<ChangeCollectStatusMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
