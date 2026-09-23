import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateBlogImageMutation,
  UpdateBlogImageMutation$data,
  UpdateBlogImageMutation$variables,
} from '@relay/UpdateBlogImageMutation.graphql'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation UpdateBlogImageMutation($input: UpdateBlogImageInput!) {
    updateBlogImage(input: $input) {
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

const commit = (variables: UpdateBlogImageMutation$variables): Promise<UpdateBlogImageMutation$data> =>
  commitMutation<UpdateBlogImageMutation>(environment, { mutation, variables })

export default { commit }
