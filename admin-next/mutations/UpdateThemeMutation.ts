import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateThemeMutation,
  UpdateThemeMutation$data,
  UpdateThemeMutation$variables,
} from '@relay/UpdateThemeMutation.graphql'

const mutation = graphql`
  mutation UpdateThemeMutation($input: UpdateThemeInput!) {
    updateTheme(input: $input) {
      theme {
        id
        title
        isEnabled
        position
        status
        customCode
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
          slug
          teaser
          body
          metaDescription
        }
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateThemeMutation$variables): Promise<UpdateThemeMutation$data> =>
  commitMutation<UpdateThemeMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
