import type {
  UpdateCookieSettingMutation,
  UpdateCookieSettingMutation$data,
  UpdateCookieSettingMutation$variables,
} from '@relay/UpdateCookieSettingMutation.graphql'
import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation UpdateCookieSettingMutation($input: UpdateCookieSettingInput!) {
    updateCookieSetting(input: $input) {
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

const commit = (variables: UpdateCookieSettingMutation$variables): Promise<UpdateCookieSettingMutation$data> =>
  commitMutation<UpdateCookieSettingMutation>(environment, { mutation, variables })

export default { commit }
