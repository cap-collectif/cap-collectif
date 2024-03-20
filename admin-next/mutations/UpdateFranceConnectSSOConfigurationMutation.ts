import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateFranceConnectSSOConfigurationMutation,
  UpdateFranceConnectSSOConfigurationMutation$data,
  UpdateFranceConnectSSOConfigurationMutation$variables,
} from '@relay/UpdateFranceConnectSSOConfigurationMutation.graphql'
import { FranceConnectAllowedData } from '@relay/UpdateFranceConnectSSOConfigurationMutation.graphql'
import uuid from '@utils/uuid'

const mutation = graphql`
  mutation UpdateFranceConnectSSOConfigurationMutation(
    $input: UpdateFranceConnectSSOConfigurationInput!
    $connections: [ID!]!
  ) @raw_response_type {
    updateFranceConnectSSOConfiguration(input: $input) {
      fcConfiguration @prependNode(connections: $connections, edgeTypeName: "SSOConfigurationEdge") {
        enabled
        ...ModalFranceConnectConfiguration_ssoConfiguration
      }
    }
  }
` as GraphQLTaggedNode

const getAllowedData = (
  variables: UpdateFranceConnectSSOConfigurationMutation$variables,
): ReadonlyArray<FranceConnectAllowedData> => {
  const allowedData = []
  if (variables.input.birthcountry) allowedData.push('birthdate')
  if (variables.input.birthcountry) allowedData.push('birthcountry')
  if (variables.input.birthplace) allowedData.push('birthplace')
  if (variables.input.email) allowedData.push('email')
  if (variables.input.family_name) allowedData.push('family_name')
  if (variables.input.gender) allowedData.push('gender')
  if (variables.input.given_name) allowedData.push('given_name')
  if (variables.input.preferred_username) allowedData.push('preferred_username')

  return allowedData as ReadonlyArray<FranceConnectAllowedData>
}

const commit = (
  variables: UpdateFranceConnectSSOConfigurationMutation$variables,
): Promise<UpdateFranceConnectSSOConfigurationMutation$data> =>
  commitMutation<UpdateFranceConnectSSOConfigurationMutation>(environment, {
    mutation,
    variables,
    optimisticResponse: {
      updateFranceConnectSSOConfiguration: {
        fcConfiguration: {
          id: `france-connect-sso-configuration-${uuid()}`,
          clientId: variables.input.clientId,
          secret: variables.input.secret,
          environment: variables.input.environment,
          redirectUri: '',
          logoutUrl: '',
          allowedData: getAllowedData(variables),
          enabled: true,
        },
      },
    },
  })

export default { commit }
