import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from '@utils/relay-environement'
import {
  DeleteGroupMutation,
  DeleteGroupMutation$data,
  DeleteGroupMutation$variables,
} from '@relay/DeleteGroupMutation.graphql'
import { GraphQLTaggedNode } from 'relay-runtime'

const mutation = graphql`
  mutation DeleteGroupMutation($input: DeleteGroupInput!, $connectionId: [ID!]!) {
    deleteGroup(input: $input) {
      deletedGroupId @deleteEdge(connections: $connectionId)
    }
  }
` as GraphQLTaggedNode

const commit = (variables: DeleteGroupMutation$variables): Promise<DeleteGroupMutation$data> =>
  commitMutation<DeleteGroupMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
