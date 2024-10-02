import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import type {
  DeleteMediaAdminMutation$variables,
  DeleteMediaAdminMutation$data,
  DeleteMediaAdminMutation,
} from '@relay/DeleteMediaAdminMutation.graphql'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'

const mutation = graphql`
  mutation DeleteMediaAdminMutation($input: DeleteMediaAdminInput!, $connections: [ID!]!) {
    deleteMediaAdmin(input: $input) {
      deletedMediaIds @deleteEdge(connections: $connections)
    }
  }
` as GraphQLTaggedNode

const commit = (variables: DeleteMediaAdminMutation$variables): Promise<DeleteMediaAdminMutation$data> =>
  commitMutation<DeleteMediaAdminMutation>(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}
