import { graphql } from 'react-relay'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  RemoveSiteFaviconMutation,
  RemoveSiteFaviconMutation$data,
  RemoveSiteFaviconMutation$variables,
} from '@relay/RemoveSiteFaviconMutation.graphql'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation RemoveSiteFaviconMutation($input: RemoveSiteFaviconInput!) {
    removeSiteFavicon(input: $input) {
      siteFavicon {
        id
        media {
          id
        }
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: RemoveSiteFaviconMutation$variables): Promise<RemoveSiteFaviconMutation$data> =>
  commitMutation<RemoveSiteFaviconMutation>(environment, { mutation, variables })

export default { commit }
