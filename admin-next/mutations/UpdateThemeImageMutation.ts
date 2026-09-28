import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateThemeImageMutation,
  UpdateThemeImageMutation$data,
  UpdateThemeImageMutation$variables,
} from '@relay/UpdateThemeImageMutation.graphql'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation UpdateThemeImageMutation($input: UpdateThemeImageInput!) {
    updateThemeImage(input: $input) {
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

const commit = (variables: UpdateThemeImageMutation$variables): Promise<UpdateThemeImageMutation$data> =>
  commitMutation<UpdateThemeImageMutation>(environment, { mutation, variables })

export default { commit }
