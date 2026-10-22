import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  CreateEmailingCampaignMutation,
  CreateEmailingCampaignMutation$data,
  CreateEmailingCampaignMutation$variables,
} from '@relay/CreateEmailingCampaignMutation.graphql'

const mutation = graphql`
  mutation CreateEmailingCampaignMutation($input: CreateEmailingCampaignInput!) {
    createEmailingCampaign(input: $input) {
      error
      emailingCampaign {
        id
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: CreateEmailingCampaignMutation$variables): Promise<CreateEmailingCampaignMutation$data> =>
  commitMutation<CreateEmailingCampaignMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
