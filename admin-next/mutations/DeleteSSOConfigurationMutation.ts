import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  DeleteSSOConfigurationMutation,
  DeleteSSOConfigurationMutation$data,
  DeleteSSOConfigurationMutation$variables,
} from '@relay/DeleteSSOConfigurationMutation.graphql'

const mutation = graphql`
  mutation DeleteSSOConfigurationMutation($input: DeleteSSOConfigurationInput!) @raw_response_type {
    deleteSSOConfiguration(input: $input) {
      deletedSsoConfigurationId @deleteRecord
    }
  }
` as GraphQLTaggedNode

const commit = (variables: DeleteSSOConfigurationMutation$variables): Promise<DeleteSSOConfigurationMutation$data> =>
  commitMutation<DeleteSSOConfigurationMutation>(environment, {
    mutation,
    variables,
    optimisticResponse: {
      deleteSSOConfiguration: {
        deletedSsoConfigurationId: variables.input.id,
      },
    },
  })

export default { commit }
