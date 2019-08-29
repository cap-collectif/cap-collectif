// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';

import type {
  AddOauth2SSOConfigurationMutationVariables,
  AddOauth2SSOConfigurationMutationResponse,
} from '~relay/AddOauth2SSOConfigurationMutation.graphql';

const mutation = graphql`
  mutation AddOauth2SSOConfigurationMutation($input: InternalCreateOauth2SSOConfigurationInput!) {
    createOauth2SSOConfiguration(input: $input) {
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
      }
    }
  }
`;

const commit = (
  variables: AddOauth2SSOConfigurationMutationVariables,
): Promise<AddOauth2SSOConfigurationMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
