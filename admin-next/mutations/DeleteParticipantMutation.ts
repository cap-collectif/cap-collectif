import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  DeleteParticipantMutation,
  DeleteParticipantMutation$variables,
  DeleteParticipantMutation$data,
} from '@relay/DeleteParticipantMutation.graphql'

const mutation = graphql`
  mutation DeleteParticipantMutation($connections: [ID!]!, $input: DeleteParticipantInput!) @raw_response_type {
    deleteParticipant(input: $input) {
      deletedParticipantId @deleteEdge(connections: $connections)
    }
  }
` as GraphQLTaggedNode

const commit = (variables: DeleteParticipantMutation$variables): Promise<DeleteParticipantMutation$data> =>
  commitMutation<DeleteParticipantMutation>(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}
