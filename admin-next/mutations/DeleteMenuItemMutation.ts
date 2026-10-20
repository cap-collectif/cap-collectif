import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  DeleteMenuItemMutation,
  DeleteMenuItemMutation$data,
  DeleteMenuItemMutation$variables,
} from '@relay/DeleteMenuItemMutation.graphql'

const mutation = graphql`
  mutation DeleteMenuItemMutation($input: DeleteMenuItemInput!, $connections: [ID!]!) {
    deleteMenuItem(input: $input) {
      deletedMenuItemId @deleteEdge(connections: $connections)
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: DeleteMenuItemMutation$variables): Promise<DeleteMenuItemMutation$data> =>
  commitMutation<DeleteMenuItemMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
