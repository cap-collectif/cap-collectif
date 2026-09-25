import type {
  UpdateLoginSettingMutation,
  UpdateLoginSettingMutation$data,
  UpdateLoginSettingMutation$variables,
} from '@relay/UpdateLoginSettingMutation.graphql'
import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation UpdateLoginSettingMutation($input: UpdateLoginSettingInput!) {
    updateLoginSetting(input: $input) {
      siteParameter {
        id
        keyname
        value
        isEnabled
        translations {
          id
          locale
          value
        }
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateLoginSettingMutation$variables): Promise<UpdateLoginSettingMutation$data> =>
  commitMutation<UpdateLoginSettingMutation>(environment, { mutation, variables })

export default { commit }
