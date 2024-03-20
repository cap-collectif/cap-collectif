import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import commitMutation from './commitMutation'
import {
  UpdateOrganizationMutation,
  UpdateOrganizationMutation$data,
  UpdateOrganizationMutation$variables,
} from '@relay/UpdateOrganizationMutation.graphql'

const mutation = graphql`
  mutation UpdateOrganizationMutation($input: UpdateOrganizationInput!) {
    updateOrganization(input: $input) {
      organization {
        title
        body
        logo {
          url
        }
        banner {
          url
        }
        socialNetworks {
          facebookUrl
          webPageUrl
          twitterUrl
          instagramUrl
          linkedInUrl
          youtubeUrl
        }
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateOrganizationMutation$variables): Promise<UpdateOrganizationMutation$data> =>
  commitMutation<UpdateOrganizationMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
