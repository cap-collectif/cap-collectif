import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  DeleteDebateOpinionMutation,
  DeleteDebateOpinionMutation$variables,
  DeleteDebateOpinionMutation$data,
} from '@relay/DeleteDebateOpinionMutation.graphql'

const mutation = graphql`
  mutation DeleteDebateOpinionMutation($input: DeleteDebateOpinionInput!, $connections: [ID!]!) {
    deleteDebateOpinion(input: $input) {
      errorCode
      deletedDebateOpinionId @deleteEdge(connections: $connections)
    }
  }
` as GraphQLTaggedNode

const commit = (variables: DeleteDebateOpinionMutation$variables): Promise<DeleteDebateOpinionMutation$data> =>
  commitMutation<DeleteDebateOpinionMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
