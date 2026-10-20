import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateMenuItemMutation,
  UpdateMenuItemMutation$data,
  UpdateMenuItemMutation$variables,
} from '@relay/UpdateMenuItemMutation.graphql'

const mutation = graphql`
  mutation UpdateMenuItemMutation($input: UpdateMenuItemInput!) {
    updateMenuItem(input: $input) {
      menuItem {
        id
        title
        menu
        position
        isEnabled
        isExternalLink
        updatedAt
        parent {
          id
        }
        page {
          id
        }
        translations {
          locale
          title
          link
        }
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateMenuItemMutation$variables): Promise<UpdateMenuItemMutation$data> =>
  commitMutation<UpdateMenuItemMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
