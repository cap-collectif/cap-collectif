import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  DeleteEmailingCampaignsMutation,
  DeleteEmailingCampaignsMutation$data,
  DeleteEmailingCampaignsMutation$variables,
} from '@relay/DeleteEmailingCampaignsMutation.graphql'

const mutation = graphql`
  mutation DeleteEmailingCampaignsMutation($input: DeleteEmailingCampaignsInput!) {
    deleteEmailingCampaigns(input: $input) {
      error
      deletedIds
      archivedIds
    }
  }
` as GraphQLTaggedNode

const commit = (variables: DeleteEmailingCampaignsMutation$variables): Promise<DeleteEmailingCampaignsMutation$data> =>
  commitMutation<DeleteEmailingCampaignsMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
