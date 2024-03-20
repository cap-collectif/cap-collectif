import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  CreateCASSSOConfigurationMutation,
  CreateCASSSOConfigurationMutation$data,
  CreateCASSSOConfigurationMutation$variables,
} from '@relay/CreateCASSSOConfigurationMutation.graphql'
import uuid from '@utils/uuid'

const mutation = graphql`
  mutation CreateCASSSOConfigurationMutation($input: CreateCASSSOConfigurationInput!, $connections: [ID!]!)
  @raw_response_type {
    createCASSSOConfiguration(input: $input) {
      ssoConfiguration @prependNode(connections: $connections, edgeTypeName: "SSOConfigurationEdge") {
        id
        name
        enabled
        casVersion
        casServerUrl
        casCertificate
      }
    }
  }
` as GraphQLTaggedNode

const commit = (
  variables: CreateCASSSOConfigurationMutation$variables,
): Promise<CreateCASSSOConfigurationMutation$data> =>
  commitMutation<CreateCASSSOConfigurationMutation>(environment, {
    mutation,
    variables,
    optimisticResponse: {
      createCASSSOConfiguration: {
        ssoConfiguration: {
          id: `sso-openID-configuration-${uuid()}`,
          name: variables.input.name,
          enabled: true,
          casVersion: variables.input.casVersion,
          casServerUrl: variables.input.casServerUrl,
          casCertificate: variables.input.casCertificate,
        },
      },
    },
  })

export default { commit }
