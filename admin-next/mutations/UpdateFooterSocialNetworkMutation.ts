import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import {
  UpdateFooterSocialNetworkMutation,
  UpdateFooterSocialNetworkMutation$data,
  UpdateFooterSocialNetworkMutation$variables,
} from '@relay/UpdateFooterSocialNetworkMutation.graphql'
import { environment } from '@utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'

const mutation = graphql`
  mutation UpdateFooterSocialNetworkMutation($input: UpdateFooterSocialNetworkInput!) {
    updateFooterSocialNetwork(input: $input) {
      footerSocialNetwork {
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
  variables: UpdateFooterSocialNetworkMutation$variables,
): Promise<UpdateFooterSocialNetworkMutation$data> =>
  commitMutation<UpdateFooterSocialNetworkMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
