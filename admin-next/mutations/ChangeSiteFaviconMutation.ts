import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  ChangeSiteFaviconMutation,
  ChangeSiteFaviconMutation$data,
  ChangeSiteFaviconMutation$variables,
} from '@relay/ChangeSiteFaviconMutation.graphql'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation ChangeSiteFaviconMutation($input: ChangeSiteFaviconInput!) {
    changeSiteFavicon(input: $input) {
      siteFavicon {
        id
        media {
          id
          name
          size
          type: contentType
          url(format: "reference")
        }
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: ChangeSiteFaviconMutation$variables): Promise<ChangeSiteFaviconMutation$data> =>
  commitMutation<ChangeSiteFaviconMutation>(environment, { mutation, variables })

export default { commit }
