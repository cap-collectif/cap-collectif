import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  DeletePostMutation,
  DeletePostMutation$data,
  DeletePostMutation$variables,
} from '@relay/DeletePostMutation.graphql'

const mutation = graphql`
  mutation DeletePostMutation($input: DeletePostInput!, $connections: [ID!]!) {
    deletePost(input: $input) {
      deletedPostId @deleteEdge(connections: $connections)
    }
  }
` as GraphQLTaggedNode

const commit = (variables: DeletePostMutation$variables): Promise<DeletePostMutation$data> =>
  commitMutation<DeletePostMutation>(environment, {
    mutation,
    variables,
    optimisticUpdater: store => {
      store.delete(variables.input.id)
    },
  })

export default { commit }
