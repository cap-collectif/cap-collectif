import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdatePageMutation,
  UpdatePageMutation$data,
  UpdatePageMutation$variables,
} from '@relay/UpdatePageMutation.graphql'

const mutation = graphql`
  mutation UpdatePageMutation($input: UpdatePageInput!) {
    updatePage(input: $input) {
      page {
        id
        title
        url
        isEnabled
        updatedAt
        customCode
        cover {
          id
          name
          size
          type: contentType
          url(format: "reference")
        }
        translations {
          locale
          title
          body
          metaDescription
        }
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdatePageMutation$variables): Promise<UpdatePageMutation$data> =>
  commitMutation<UpdatePageMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
