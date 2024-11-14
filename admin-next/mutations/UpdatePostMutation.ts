import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import type {
  UpdatePostMutation$variables,
  UpdatePostMutation$data,
  UpdatePostMutation,
} from '@relay/UpdatePostMutation.graphql'
import { GraphQLTaggedNode } from 'relay-runtime'

const mutation = graphql`
  mutation UpdatePostMutation($input: UpdatePostInput!) {
    updatePost(input: $input) {
      post {
        title
        body
        bodyUsingJoditWysiwyg
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdatePostMutation$variables): Promise<UpdatePostMutation$data> =>
  commitMutation<UpdatePostMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
