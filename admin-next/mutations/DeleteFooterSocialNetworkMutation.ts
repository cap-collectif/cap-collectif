import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from '@utils/relay-environement'
import {
  DeleteFooterSocialNetworkMutation,
  DeleteFooterSocialNetworkMutation$data,
  DeleteFooterSocialNetworkMutation$variables,
} from '@relay/DeleteFooterSocialNetworkMutation.graphql'
import { GraphQLTaggedNode } from 'relay-runtime'

const mutation = graphql`
  mutation DeleteFooterSocialNetworkMutation($input: DeleteFooterSocialNetworkInput!, $connections: [ID!]!) {
    deleteFooterSocialNetwork(input: $input) {
      deletedFooterSocialNetworkId @deleteEdge(connections: $connections)
    }
  }
` as GraphQLTaggedNode

const commit = (
  variables: DeleteFooterSocialNetworkMutation$variables,
): Promise<DeleteFooterSocialNetworkMutation$data> =>
  commitMutation<DeleteFooterSocialNetworkMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
