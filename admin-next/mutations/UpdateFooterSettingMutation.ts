import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateFooterSettingMutation,
  UpdateFooterSettingMutation$data,
  UpdateFooterSettingMutation$variables,
} from '@relay/UpdateFooterSettingMutation.graphql'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation UpdateFooterSettingMutation($input: UpdateFooterSettingInput!) {
    updateFooterSetting(input: $input) {
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

const commit = (variables: UpdateFooterSettingMutation$variables): Promise<UpdateFooterSettingMutation$data> =>
  commitMutation<UpdateFooterSettingMutation>(environment, { mutation, variables })

export default { commit }
