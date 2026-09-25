import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateProjectSettingMutation,
  UpdateProjectSettingMutation$data,
  UpdateProjectSettingMutation$variables,
} from '@relay/UpdateProjectSettingMutation.graphql'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation UpdateProjectSettingMutation($input: UpdateProjectSettingInput!) {
    updateProjectSetting(input: $input) {
      siteParameter {
        id
        value
        isEnabled
        translations {
          locale
          value
        }
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateProjectSettingMutation$variables): Promise<UpdateProjectSettingMutation$data> =>
  commitMutation<UpdateProjectSettingMutation>(environment, { mutation, variables })

export default { commit }
