import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  DeletePageMutation,
  DeletePageMutation$data,
  DeletePageMutation$variables,
} from '@relay/DeletePageMutation.graphql'

const mutation = graphql`
  mutation DeletePageMutation($input: DeletePageInput!, $connections: [ID!]!) {
    deletePage(input: $input) {
      deletedPageId @deleteEdge(connections: $connections)
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: DeletePageMutation$variables): Promise<DeletePageMutation$data> =>
  commitMutation<DeletePageMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
