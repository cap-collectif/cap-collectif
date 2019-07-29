// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';

import type {
  DeleteOauth2SSOConfigurationVariables,
  DeleteOauth2SSOConfigurationResponse,
} from '~relay/DeleteOauth2SSOConfigurationMutation.graphql';

const mutation = graphql`
  mutation DeleteOauth2SSOConfigurationMutation($input: InternalDeleteSSOConfigurationInput!) {
    deleteSSOConfiguration(input: $input) {
      deletedSsoConfigurationId
    }
  }
`;

const commit = (
  variables: DeleteOauth2SSOConfigurationVariables,
): Promise<DeleteOauth2SSOConfigurationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
