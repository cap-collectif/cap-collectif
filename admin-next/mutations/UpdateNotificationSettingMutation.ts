import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateNotificationSettingMutation,
  UpdateNotificationSettingMutation$data,
  UpdateNotificationSettingMutation$variables,
} from '@relay/UpdateNotificationSettingMutation.graphql'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation UpdateNotificationSettingMutation($input: UpdateNotificationSettingInput!) {
    updateNotificationSetting(input: $input) {
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
  variables: UpdateNotificationSettingMutation$variables,
): Promise<UpdateNotificationSettingMutation$data> =>
  commitMutation<UpdateNotificationSettingMutation>(environment, { mutation, variables })

export default { commit }
