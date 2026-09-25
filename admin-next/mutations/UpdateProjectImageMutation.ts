import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateProjectImageMutation,
  UpdateProjectImageMutation$data,
  UpdateProjectImageMutation$variables,
} from '@relay/UpdateProjectImageMutation.graphql'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation UpdateProjectImageMutation($input: UpdateProjectImageInput!) {
    updateProjectImage(input: $input) {
      siteImage {
        id
        isEnabled
        media {
          id
          name
          size
          type: contentType
          url(format: "default_logo")
        }
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateProjectImageMutation$variables): Promise<UpdateProjectImageMutation$data> =>
  commitMutation<UpdateProjectImageMutation>(environment, { mutation, variables })

export default { commit }
