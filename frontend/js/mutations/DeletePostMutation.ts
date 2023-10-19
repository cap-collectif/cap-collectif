// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type { DeletePostMutationVariables, DeletePostMutationResponse } from '~relay/DeletePostMutation.graphql'

const mutation = graphql`
  mutation DeletePostMutation($input: DeletePostInput!, $connections: [ID!]!) {
    deletePost(input: $input) {
      deletedPostId @deleteEdge(connections: $connections)
    }
  }
`

const commit = (variables: DeletePostMutationVariables): Promise<DeletePostMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    optimisticResponse: {
      deletePost: {
        deletedPostId: variables.input.id,
      },
    },
  })

export default {
  commit,
}
