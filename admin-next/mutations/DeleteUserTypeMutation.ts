import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from '@utils/relay-environement'
import {
  DeleteUserTypeMutation,
  DeleteUserTypeMutation$data,
  DeleteUserTypeMutation$variables,
} from '@relay/DeleteUserTypeMutation.graphql'
import { GraphQLTaggedNode } from 'relay-runtime'

const mutation = graphql`
  mutation DeleteUserTypeMutation($input: DeleteUserTypeInput!, $connections: [ID!]!) {
    deleteUserType(input: $input) {
      deletedUserTypeId @deleteEdge(connections: $connections)
    }
  }
` as GraphQLTaggedNode

const commit = (variables: DeleteUserTypeMutation$variables): Promise<DeleteUserTypeMutation$data> =>
  commitMutation<DeleteUserTypeMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
