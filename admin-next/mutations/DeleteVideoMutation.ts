import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  DeleteVideoMutation,
  DeleteVideoMutation$data,
  DeleteVideoMutation$variables,
} from '@relay/DeleteVideoMutation.graphql'

const mutation = graphql`
  mutation DeleteVideoMutation($input: DeleteVideoInput!, $connections: [ID!]!) {
    deleteVideo(input: $input) {
      deletedVideoId @deleteEdge(connections: $connections)
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: DeleteVideoMutation$variables): Promise<DeleteVideoMutation$data> =>
  commitMutation<DeleteVideoMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
