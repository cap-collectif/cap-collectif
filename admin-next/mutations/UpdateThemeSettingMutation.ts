import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateThemeSettingMutation,
  UpdateThemeSettingMutation$data,
  UpdateThemeSettingMutation$variables,
} from '@relay/UpdateThemeSettingMutation.graphql'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation UpdateThemeSettingMutation($input: UpdateThemeSettingInput!) {
    updateThemeSetting(input: $input) {
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

const commit = (variables: UpdateThemeSettingMutation$variables): Promise<UpdateThemeSettingMutation$data> =>
  commitMutation<UpdateThemeSettingMutation>(environment, { mutation, variables })

export default { commit }
