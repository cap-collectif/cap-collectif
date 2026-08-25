import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import {
  CreateSocialNetworkMutation,
  CreateSocialNetworkMutation$data,
  CreateSocialNetworkMutation$variables,
} from '@relay/CreateSocialNetworkMutation.graphql'
import { environment } from '@utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'

const mutation = graphql`
  mutation CreateSocialNetworkMutation($input: CreateSocialNetworkInput!, $connections: [ID!]!) {
    createSocialNetwork(input: $input) {
      socialNetwork @prependNode(connections: $connections, edgeTypeName: "SocialNetworkEdge") {
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

const commit = (variables: CreateSocialNetworkMutation$variables): Promise<CreateSocialNetworkMutation$data> =>
  commitMutation<CreateSocialNetworkMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
