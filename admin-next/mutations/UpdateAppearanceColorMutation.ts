import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateAppearanceColorMutation,
  UpdateAppearanceColorMutation$data,
  UpdateAppearanceColorMutation$variables,
} from '@relay/UpdateAppearanceColorMutation.graphql'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation UpdateAppearanceColorMutation($input: UpdateAppearanceColorInput!) {
    updateAppearanceColor(input: $input) {
      siteColor {
        id
        keyname
        value
        isEnabled
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateAppearanceColorMutation$variables): Promise<UpdateAppearanceColorMutation$data> =>
  commitMutation<UpdateAppearanceColorMutation>(environment, { mutation, variables })

export default { commit }
