import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  CreateMenuItemMutation,
  CreateMenuItemMutation$data,
  CreateMenuItemMutation$variables,
} from '@relay/CreateMenuItemMutation.graphql'

const mutation = graphql`
  mutation CreateMenuItemMutation($input: CreateMenuItemInput!) {
    createMenuItem(input: $input) {
      menuItem {
        id
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: CreateMenuItemMutation$variables): Promise<CreateMenuItemMutation$data> =>
  commitMutation<CreateMenuItemMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
