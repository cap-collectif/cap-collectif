import { graphql } from 'react-relay'

import commitMutation from './commitMutation'
import { environment } from '@utils/relay-environement'
import {
  DeleteUserInGroupMutation,
  DeleteUserInGroupMutation$data,
  DeleteUserInGroupMutation$variables,
} from '@relay/DeleteUserInGroupMutation.graphql'
import { GraphQLTaggedNode } from 'relay-runtime'

const mutation = graphql`
  mutation DeleteUserInGroupMutation($input: DeleteUserInGroupInput!) {
    deleteUserInGroup(input: $input) {
      group {
        id
        users {
          edges {
            node {
              id
            }
          }
        }
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: DeleteUserInGroupMutation$variables): Promise<DeleteUserInGroupMutation$data> =>
  commitMutation<DeleteUserInGroupMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
