import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateVideoMutation,
  UpdateVideoMutation$data,
  UpdateVideoMutation$variables,
} from '@relay/UpdateVideoMutation.graphql'

const mutation = graphql`
  mutation UpdateVideoMutation($input: UpdateVideoInput!) {
    updateVideo(input: $input) {
      video {
        id
        title
        link
        isEnabled
        position
        updatedAt
        author {
          id
          displayName
        }
        media {
          id
          url
        }
        translations {
          locale
          title
          body
        }
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateVideoMutation$variables): Promise<UpdateVideoMutation$data> =>
  commitMutation<UpdateVideoMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
