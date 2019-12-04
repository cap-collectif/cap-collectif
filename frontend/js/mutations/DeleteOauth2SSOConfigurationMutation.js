// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';

import type {
  DeleteOauth2SSOConfigurationMutationVariables,
  DeleteOauth2SSOConfigurationMutationResponse,
} from '~relay/DeleteOauth2SSOConfigurationMutation.graphql';

const mutation = graphql`
  mutation DeleteOauth2SSOConfigurationMutation($input: InternalDeleteSSOConfigurationInput!) {
    deleteSSOConfiguration(input: $input) {
      deletedSsoConfigurationId
    }
  }
`;

const commit = (
  variables: DeleteOauth2SSOConfigurationMutationVariables,
): Promise<DeleteOauth2SSOConfigurationMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    configs: [
      {
        type: 'NODE_DELETE',
        deletedIDFieldName: 'deletedSsoConfigurationId',
      },
    ],
  });

export default { commit };
