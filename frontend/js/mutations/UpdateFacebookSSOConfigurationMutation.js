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
  mutation UpdateFacebookSSOConfigurationMutation(
    $input: UpdateFacebookSSOConfigurationInput!
    $connections: [ID!]!
  ) {
    updateFacebookSSOConfiguration(input: $input) {
      facebookSSOConfiguration
        @prependNode(connections: $connections, edgeTypeName: "SSOConfigurationEdge") {
        id
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
  connectionId: string,
): ?Promise<UpdateFacebookSSOConfigurationMutationResponse> => {
  if (ssoConfiguration && ssoConfiguration.clientId && ssoConfiguration.secret) {
    return commit({
      input: {
        clientId: ssoConfiguration.clientId,
        secret: ssoConfiguration.secret,
        enabled: !ssoConfiguration.enabled,
      },
      connections: [connectionId],
    });
  }
};

export default { commit };
