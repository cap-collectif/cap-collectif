import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  SendEmailingCampaignMutation,
  SendEmailingCampaignMutation$data,
  SendEmailingCampaignMutation$variables,
} from '@relay/SendEmailingCampaignMutation.graphql'

const mutation = graphql`
  mutation SendEmailingCampaignMutation($input: SendEmailingCampaignInput!) {
    sendEmailingCampaign(input: $input) {
      error
      emailingCampaign {
        id
        status
        sendAt
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: SendEmailingCampaignMutation$variables): Promise<SendEmailingCampaignMutation$data> =>
  commitMutation<SendEmailingCampaignMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
