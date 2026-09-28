import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateEventSettingMutation,
  UpdateEventSettingMutation$data,
  UpdateEventSettingMutation$variables,
} from '@relay/UpdateEventSettingMutation.graphql'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation UpdateEventSettingMutation($input: UpdateEventSettingInput!) {
    updateEventSetting(input: $input) {
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

const commit = (variables: UpdateEventSettingMutation$variables): Promise<UpdateEventSettingMutation$data> =>
  commitMutation<UpdateEventSettingMutation>(environment, { mutation, variables })

export default { commit }
