import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateCASSSOConfigurationMutation,
  UpdateCASSSOConfigurationMutation$data,
  UpdateCASSSOConfigurationMutation$variables,
} from '@relay/UpdateCASSSOConfigurationMutation.graphql'

const mutation = graphql`
  mutation UpdateCASSSOConfigurationMutation($input: UpdateCASSSOConfigurationInput!) @raw_response_type {
    updateCASSSOConfiguration(input: $input) {
      ssoConfiguration {
        id
        name
        casVersion
        casServerUrl
        casCertificate
      }
    }
  }
` as GraphQLTaggedNode

const commit = (
  variables: UpdateCASSSOConfigurationMutation$variables,
): Promise<UpdateCASSSOConfigurationMutation$data> =>
  commitMutation<UpdateCASSSOConfigurationMutation>(environment, {
    mutation,
    variables,
    optimisticResponse: {
      updateCASSSOConfiguration: {
        ssoConfiguration: {
          id: variables.input.id,
          name: variables.input.name,
          casVersion: variables.input.casVersion,
          casServerUrl: variables.input.casServerUrl,
          casCertificate: variables.input.casCertificate,
        },
      },
    },
  })

export default { commit }
