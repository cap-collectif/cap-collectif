import type {
  UpdateLegalSettingMutation,
  UpdateLegalSettingMutation$data,
  UpdateLegalSettingMutation$variables,
} from '@relay/UpdateLegalSettingMutation.graphql'
import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation UpdateLegalSettingMutation($input: UpdateLegalSettingInput!) {
    updateLegalSetting(input: $input) {
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

const commit = (variables: UpdateLegalSettingMutation$variables): Promise<UpdateLegalSettingMutation$data> =>
  commitMutation<UpdateLegalSettingMutation>(environment, { mutation, variables })

export default { commit }
