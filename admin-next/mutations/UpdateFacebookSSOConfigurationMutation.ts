import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateFacebookSSOConfigurationMutation,
  UpdateFacebookSSOConfigurationMutation$data,
  UpdateFacebookSSOConfigurationMutation$variables,
} from '@relay/UpdateFacebookSSOConfigurationMutation.graphql'
import { CardFacebook_ssoConfiguration$data } from '@relay/CardFacebook_ssoConfiguration.graphql'
import uuid from '@utils/uuid'

const mutation = graphql`
  mutation UpdateFacebookSSOConfigurationMutation($input: UpdateFacebookSSOConfigurationInput!, $connections: [ID!]!)
  @raw_response_type {
    updateFacebookSSOConfiguration(input: $input) {
      facebookSSOConfiguration @prependNode(connections: $connections, edgeTypeName: "SSOConfigurationEdge") {
        clientId
        secret
        enabled
      }
    }
  }
` as GraphQLTaggedNode

const commit = (
  variables: UpdateFacebookSSOConfigurationMutation$variables,
): Promise<UpdateFacebookSSOConfigurationMutation$data> =>
  commitMutation<UpdateFacebookSSOConfigurationMutation>(environment, {
    mutation,
    variables,
    optimisticResponse: {
      updateFacebookSSOConfiguration: {
        facebookSSOConfiguration: {
          id: `facebook-sso-configuration-${uuid()}`,
          clientId: variables.input.clientId,
          secret: variables.input.secret,
          enabled: variables.input.enabled,
        },
      },
    },
  })

export const toggleFacebook = (ssoConfiguration: CardFacebook_ssoConfiguration$data, connectionName: string) => {
  if (ssoConfiguration && ssoConfiguration.clientId && ssoConfiguration.secret) {
    return commit({
      input: {
        clientId: ssoConfiguration.clientId,
        secret: ssoConfiguration.secret,
        enabled: !ssoConfiguration.enabled,
      },
      connections: [connectionName],
    })
  }
}

export default { commit }
