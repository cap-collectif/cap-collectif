import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import {
  CreateFooterSocialNetworkMutation,
  CreateFooterSocialNetworkMutation$data,
  CreateFooterSocialNetworkMutation$variables,
} from '@relay/CreateFooterSocialNetworkMutation.graphql'
import { environment } from '@utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'

const mutation = graphql`
  mutation CreateFooterSocialNetworkMutation($input: CreateFooterSocialNetworkInput!, $connections: [ID!]!) {
    createFooterSocialNetwork(input: $input) {
      footerSocialNetwork @prependNode(connections: $connections, edgeTypeName: "FooterSocialNetworkEdge") {
        id
        title
        link
        style
        isEnabled
        position
      }
      errorCode
    }
  }
` as GraphQLTaggedNode

const commit = (
  variables: CreateFooterSocialNetworkMutation$variables,
): Promise<CreateFooterSocialNetworkMutation$data> =>
  commitMutation<CreateFooterSocialNetworkMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
