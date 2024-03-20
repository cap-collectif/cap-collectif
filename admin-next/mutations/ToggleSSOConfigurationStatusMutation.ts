import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  ToggleSSOConfigurationStatusMutation,
  ToggleSSOConfigurationStatusMutation$data,
  ToggleSSOConfigurationStatusMutation$variables,
} from '@relay/ToggleSSOConfigurationStatusMutation.graphql'

const mutation = graphql`
  mutation ToggleSSOConfigurationStatusMutation($input: ToggleSSOConfigurationStatusInput!) @raw_response_type {
    toggleSSOConfigurationStatus(input: $input) {
      ssoConfiguration {
        enabled
      }
    }
  }
` as GraphQLTaggedNode

const commit = (
  variables: ToggleSSOConfigurationStatusMutation$variables,
  enabled: boolean,
  typename: string,
): Promise<ToggleSSOConfigurationStatusMutation$data> =>
  commitMutation<ToggleSSOConfigurationStatusMutation>(environment, {
    mutation,
    variables,
    optimisticResponse: {
      toggleSSOConfigurationStatus: {
        ssoConfiguration: {
          __typename: typename,
          id: variables.input.ssoConfigurationId,
          enabled: !enabled,
        },
      },
    },
  })

export const toggleSSO = (ssoId: string, enabled: boolean, typename: string) => {
  return commit(
    {
      input: {
        ssoConfigurationId: ssoId,
      },
    },
    enabled,
    typename,
  )
}

export default { commit }
