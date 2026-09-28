import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateEventImageMutation,
  UpdateEventImageMutation$data,
  UpdateEventImageMutation$variables,
} from '@relay/UpdateEventImageMutation.graphql'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation UpdateEventImageMutation($input: UpdateEventImageInput!) {
    updateEventImage(input: $input) {
      siteImage {
        id
        isEnabled
        media {
          id
          name
          size
          type: contentType
          url(format: "reference")
        }
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateEventImageMutation$variables): Promise<UpdateEventImageMutation$data> =>
  commitMutation<UpdateEventImageMutation>(environment, { mutation, variables })

export default { commit }
