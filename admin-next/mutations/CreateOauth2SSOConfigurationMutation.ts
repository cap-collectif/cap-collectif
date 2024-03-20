import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  CreateOauth2SSOConfigurationMutation,
  CreateOauth2SSOConfigurationMutation$data,
  CreateOauth2SSOConfigurationMutation$variables,
} from '@relay/CreateOauth2SSOConfigurationMutation.graphql'
import uuid from '@utils/uuid'

const mutation = graphql`
  mutation CreateOauth2SSOConfigurationMutation($input: CreateOauth2SSOConfigurationInput!, $connections: [ID!]!)
  @raw_response_type {
    createOauth2SSOConfiguration(input: $input) {
      ssoConfiguration @prependNode(connections: $connections, edgeTypeName: "SSOConfigurationEdge") {
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
        disconnectSsoOnLogout
      }
    }
  }
` as GraphQLTaggedNode

const commit = (
  variables: CreateOauth2SSOConfigurationMutation$variables,
): Promise<CreateOauth2SSOConfigurationMutation$data> =>
  commitMutation<CreateOauth2SSOConfigurationMutation>(environment, {
    mutation,
    variables,
    optimisticResponse: {
      createOauth2SSOConfiguration: {
        ssoConfiguration: {
          id: `sso-openID-configuration-${uuid()}`,
          name: variables.input.name,
          enabled: true,
          clientId: variables.input.clientId,
          secret: variables.input.secret,
          authorizationUrl: variables.input.authorizationUrl,
          accessTokenUrl: variables.input.accessTokenUrl,
          userInfoUrl: variables.input.userInfoUrl,
          logoutUrl: typeof variables.input.logoutUrl === 'undefined' ? null : variables.input.logoutUrl,
          profileUrl: typeof variables.input.logoutUrl === 'undefined' ? null : variables.input.logoutUrl,
          disconnectSsoOnLogout: variables.input.disconnectSsoOnLogout,
        },
      },
    },
  })

export default { commit }
