import type {
  UpdateCharterSettingMutation,
  UpdateCharterSettingMutation$data,
  UpdateCharterSettingMutation$variables,
} from '@relay/UpdateCharterSettingMutation.graphql'
import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation UpdateCharterSettingMutation($input: UpdateCharterSettingInput!) {
    updateCharterSetting(input: $input) {
      siteParameter {
        id
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

const commit = (variables: UpdateCharterSettingMutation$variables): Promise<UpdateCharterSettingMutation$data> =>
  commitMutation<UpdateCharterSettingMutation>(environment, { mutation, variables })

export default { commit }
