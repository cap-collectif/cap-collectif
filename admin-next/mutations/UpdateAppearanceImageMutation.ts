import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateAppearanceImageMutation,
  UpdateAppearanceImageMutation$data,
  UpdateAppearanceImageMutation$variables,
} from '@relay/UpdateAppearanceImageMutation.graphql'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation UpdateAppearanceImageMutation($input: UpdateAppearanceImageInput!) {
    updateAppearanceImage(input: $input) {
      siteImage {
        id
        keyname
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

const commit = (variables: UpdateAppearanceImageMutation$variables): Promise<UpdateAppearanceImageMutation$data> =>
  commitMutation<UpdateAppearanceImageMutation>(environment, { mutation, variables })

export default { commit }
