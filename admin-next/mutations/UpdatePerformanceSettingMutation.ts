import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdatePerformanceSettingMutation,
  UpdatePerformanceSettingMutation$data,
  UpdatePerformanceSettingMutation$variables,
} from '@relay/UpdatePerformanceSettingMutation.graphql'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation UpdatePerformanceSettingMutation($input: UpdatePerformanceSettingInput!) {
    updatePerformanceSetting(input: $input) {
      siteParameter {
        id
        keyname
        value
        isEnabled
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (
  variables: UpdatePerformanceSettingMutation$variables,
): Promise<UpdatePerformanceSettingMutation$data> =>
  commitMutation<UpdatePerformanceSettingMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
