// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateFacebookSSOConfigurationMutationResponse,
  UpdateFacebookSSOConfigurationMutationVariables,
} from '~relay/UpdateFacebookSSOConfigurationMutation.graphql';
import type { FacebookConfigurationCard_ssoConfiguration } from '~relay/FacebookConfigurationCard_ssoConfiguration.graphql';

const mutation = graphql`
  mutation UpdateFacebookSSOConfigurationMutation($input: UpdateFacebookSSOConfigurationInput!) {
    updateFacebookSSOConfiguration(input: $input) {
      facebookSSOConfiguration {
        clientId
        secret
        enabled
      }
    }
  }
`;

const commit = (
  variables: UpdateFacebookSSOConfigurationMutationVariables,
): Promise<UpdateFacebookSSOConfigurationMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export const toggle = (
  ssoConfiguration: FacebookConfigurationCard_ssoConfiguration,
): ?Promise<UpdateFacebookSSOConfigurationMutationResponse> => {
  if (ssoConfiguration && ssoConfiguration.clientId && ssoConfiguration.secret) {
    return commit({
      input: {
        clientId: ssoConfiguration.clientId,
        secret: ssoConfiguration.secret,
        enabled: !ssoConfiguration.enabled,
      },
    });
  }
};

export default { commit };
