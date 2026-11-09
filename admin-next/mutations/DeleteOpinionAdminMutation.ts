import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  DeleteOpinionAdminMutation,
  DeleteOpinionAdminMutation$data,
  DeleteOpinionAdminMutation$variables,
} from '@relay/DeleteOpinionAdminMutation.graphql'

const mutation = graphql`
  mutation DeleteOpinionAdminMutation($input: DeleteOpinionAdminInput!, $connections: [ID!]!) {
    deleteOpinionAdmin(input: $input) {
      deletedOpinionId @deleteEdge(connections: $connections)
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: DeleteOpinionAdminMutation$variables): Promise<DeleteOpinionAdminMutation$data> =>
  commitMutation<DeleteOpinionAdminMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
