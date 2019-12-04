// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateFranceConnectSSOConfigurationMutationResponse,
  UpdateFranceConnectSSOConfigurationMutationVariables,
} from '~relay/UpdateFranceConnectSSOConfigurationMutation.graphql';

const mutation = graphql`
  mutation UpdateFranceConnectSSOConfigurationMutation(
    $input: InternalUpdateFranceConnectSSOConfigurationInput!
  ) {
    updateFranceConnectSSOConfiguration(input: $input) {
      fcConfiguration {
        clientId
        secret
        redirectUri
        logoutUrl
      }
    }
  }
`;

const commit = (
  variables: UpdateFranceConnectSSOConfigurationMutationVariables,
): Promise<UpdateFranceConnectSSOConfigurationMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
