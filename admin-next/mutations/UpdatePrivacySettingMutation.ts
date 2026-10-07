import type {
  UpdatePrivacySettingMutation,
  UpdatePrivacySettingMutation$data,
  UpdatePrivacySettingMutation$variables,
} from '@relay/UpdatePrivacySettingMutation.graphql'
import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation UpdatePrivacySettingMutation($input: UpdatePrivacySettingInput!) {
    updatePrivacySetting(input: $input) {
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

const commit = (variables: UpdatePrivacySettingMutation$variables): Promise<UpdatePrivacySettingMutation$data> =>
  commitMutation<UpdatePrivacySettingMutation>(environment, { mutation, variables })

export default { commit }
