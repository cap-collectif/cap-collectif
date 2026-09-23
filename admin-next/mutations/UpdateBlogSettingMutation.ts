import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateBlogSettingMutation,
  UpdateBlogSettingMutation$data,
  UpdateBlogSettingMutation$variables,
} from '@relay/UpdateBlogSettingMutation.graphql'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation UpdateBlogSettingMutation($input: UpdateBlogSettingInput!) {
    updateBlogSetting(input: $input) {
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

const commit = (variables: UpdateBlogSettingMutation$variables): Promise<UpdateBlogSettingMutation$data> =>
  commitMutation<UpdateBlogSettingMutation>(environment, { mutation, variables })

export default { commit }
