import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import {
  UpdateSocialNetworkMutation,
  UpdateSocialNetworkMutation$data,
  UpdateSocialNetworkMutation$variables,
} from '@relay/UpdateSocialNetworkMutation.graphql'
import { environment } from '@utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'

const mutation = graphql`
  mutation UpdateSocialNetworkMutation($input: UpdateSocialNetworkInput!) {
    updateSocialNetwork(input: $input) {
      socialNetwork {
        id
        title
        link
        position
        isEnabled
        media {
          id
          name
          size
          type: contentType
          url(format: "default_socialIcon")
        }
        updatedAt
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateSocialNetworkMutation$variables): Promise<UpdateSocialNetworkMutation$data> =>
  commitMutation<UpdateSocialNetworkMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
