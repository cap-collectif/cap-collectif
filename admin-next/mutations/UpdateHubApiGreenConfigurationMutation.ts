import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateHubApiGreenConfigurationMutation,
  UpdateHubApiGreenConfigurationMutation$data,
  UpdateHubApiGreenConfigurationMutation$variables,
} from '@relay/UpdateHubApiGreenConfigurationMutation.graphql'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation UpdateHubApiGreenConfigurationMutation($input: UpdateHubApiGreenConfigurationInput!) {
    updateHubApiGreenConfiguration(input: $input) {
      configuration {
        isConfigured
      }
    }
  }
` as GraphQLTaggedNode

const commit = (
  variables: UpdateHubApiGreenConfigurationMutation$variables,
): Promise<UpdateHubApiGreenConfigurationMutation$data> =>
  commitMutation<UpdateHubApiGreenConfigurationMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
