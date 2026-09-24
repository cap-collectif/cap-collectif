import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  CreateVideoMutation,
  CreateVideoMutation$data,
  CreateVideoMutation$variables,
} from '@relay/CreateVideoMutation.graphql'

const mutation = graphql`
  mutation CreateVideoMutation($input: CreateVideoInput!) {
    createVideo(input: $input) {
      video {
        id
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: CreateVideoMutation$variables): Promise<CreateVideoMutation$data> =>
  commitMutation<CreateVideoMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
