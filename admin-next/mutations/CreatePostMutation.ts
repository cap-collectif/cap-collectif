import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import type {
  CreatePostMutation$variables,
  CreatePostMutation$data,
  CreatePostMutation,
} from '@relay/CreatePostMutation.graphql'
import { GraphQLTaggedNode } from 'relay-runtime'

const mutation = graphql`
  mutation CreatePostMutation($input: CreatePostInput!) {
    createPost(input: $input) {
      post {
        title
        body
        adminUrl
        id
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: CreatePostMutation$variables): Promise<CreatePostMutation$data> =>
  commitMutation<CreatePostMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
