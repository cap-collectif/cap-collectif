import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  CancelEmailingCampaignMutation,
  CancelEmailingCampaignMutation$data,
  CancelEmailingCampaignMutation$variables,
} from '@relay/CancelEmailingCampaignMutation.graphql'

const mutation = graphql`
  mutation CancelEmailingCampaignMutation($input: CancelEmailingCampaignInput!) {
    cancelEmailingCampaign(input: $input) {
      error
      emailingCampaign {
        id
        name
        status
        sendAt
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: CancelEmailingCampaignMutation$variables): Promise<CancelEmailingCampaignMutation$data> =>
  commitMutation<CancelEmailingCampaignMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
