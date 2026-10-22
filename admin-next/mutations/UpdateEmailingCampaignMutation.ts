import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateEmailingCampaignMutation,
  UpdateEmailingCampaignMutation$data,
  UpdateEmailingCampaignMutation$variables,
} from '@relay/UpdateEmailingCampaignMutation.graphql'

const mutation = graphql`
  mutation UpdateEmailingCampaignMutation($input: UpdateEmailingCampaignInput!) {
    updateEmailingCampaign(input: $input) {
      error
      emailingCampaign {
        ...EmailingCampaignFormWrapper_emailingCampaign
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateEmailingCampaignMutation$variables): Promise<UpdateEmailingCampaignMutation$data> =>
  commitMutation<UpdateEmailingCampaignMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
