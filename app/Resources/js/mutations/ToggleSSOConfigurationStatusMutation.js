// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  ToggleSSOConfigurationStatusMutationResponse,
  ToggleSSOConfigurationStatusMutationVariables,
} from '~relay/ToggleSSOConfigurationStatusMutation.graphql';
import type { SSOConfigurationInterface } from '~/types';

const mutation = graphql`
  mutation ToggleSSOConfigurationStatusMutation(
    $input: InternalToggleSSOConfigurationStatusInput!
  ) {
    toggleSSOConfigurationStatus(input: $input) {
      ssoConfiguration {
        enabled
      }
    }
  }
`;

const commit = (
  ssoConfiguration: SSOConfigurationInterface,
  variables: ToggleSSOConfigurationStatusMutationVariables,
): Promise<ToggleSSOConfigurationStatusMutationResponse> => {
  const optimisticResponse = {
    toggleSSOConfigurationStatus: {
      ssoConfiguration: {
        id: ssoConfiguration.id,
        __typename: ssoConfiguration.__typename,
        enabled: !ssoConfiguration.enabled,
      },
    },
  };
  return commitMutation(environment, {
    mutation,
    variables,
    optimisticResponse,
  });
};

export const toggleStatus = (
  ssoConfiguration: ?SSOConfigurationInterface,
): ?Promise<ToggleSSOConfigurationStatusMutationResponse> => {
  if (ssoConfiguration && ssoConfiguration.id) {
    return commit(ssoConfiguration, {
      input: { ssoConfigurationId: ssoConfiguration.id },
    });
  }
};

export default { commit };
