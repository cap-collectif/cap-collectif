// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';

import type {
  UpdateOauth2SSOConfigurationVariables,
  UpdateOauth2SSOConfigurationResponse,
} from '~relay/UpdateOauth2SSOConfigurationMutation.graphql';

const mutation = graphql`
  mutation UpdateOauth2SSOConfigurationMutation(
    $input: InternalUpdateOauth2SSOConfigurationInput!
  ) {
    updateOauth2SSOConfiguration(input: $input) {
      ssoConfiguration {
        id
        name
        enabled
        clientId
        secret
        authorizationUrl
        accessTokenUrl
        userInfoUrl
        logoutUrl
        profileUrl
        buttonColor
        labelColor
      }
    }
  }
`;

const commit = (
  variables: UpdateOauth2SSOConfigurationVariables,
): Promise<UpdateOauth2SSOConfigurationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
