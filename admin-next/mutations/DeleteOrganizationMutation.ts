import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import { environment } from 'utils/relay-environement'
import {
  DeleteOrganizationMutation,
  DeleteOrganizationMutation$data,
  DeleteOrganizationMutation$variables,
} from '@relay/DeleteOrganizationMutation.graphql'

const mutation = graphql`
  mutation DeleteOrganizationMutation($input: DeleteOrganizationInput!) {
    deleteOrganization(input: $input) {
      deletedOrganization {
        title
        slug
        body
        banner {
          url
        }
        logo {
          url
        }
        members {
          edges {
            node {
              user {
                username
              }
            }
          }
        }
        socialNetworks {
          webPageUrl
          facebookUrl
          twitterUrl
          youtubeUrl
          linkedInUrl
          instagramUrl
        }
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (variables: DeleteOrganizationMutation$variables): Promise<DeleteOrganizationMutation$data> =>
  commitMutation<DeleteOrganizationMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
