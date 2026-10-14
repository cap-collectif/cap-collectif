import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateFooterColorMutation,
  UpdateFooterColorMutation$data,
  UpdateFooterColorMutation$variables,
} from '@relay/UpdateFooterColorMutation.graphql'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation UpdateFooterColorMutation($input: UpdateFooterColorInput!) {
    updateFooterColor(input: $input) {
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

const commit = (variables: UpdateFooterColorMutation$variables): Promise<UpdateFooterColorMutation$data> =>
  commitMutation<UpdateFooterColorMutation>(environment, { mutation, variables })

export default { commit }
