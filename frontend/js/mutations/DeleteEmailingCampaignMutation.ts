// @ts-nocheck
import { graphql } from 'react-relay'
import { ConnectionHandler } from 'relay-runtime'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  DeleteEmailingCampaignMutationVariables,
  DeleteEmailingCampaignMutationResponse,
} from '~relay/DeleteEmailingCampaignMutation.graphql'
import { createQueryVariables } from '~/components/Admin/Emailing/EmailingCampaign/utils'
import type { DashboardParameters } from '~/components/Admin/Emailing/EmailingCampaign/DashboardCampaign/DashboardCampaign.reducer'
type Variables = DeleteEmailingCampaignMutationVariables & {
  parametersConnection: DashboardParameters
}

/**
 * The @deleteRecord will accept multiple ids soon (I hope, cc https://github.com/facebook/relay/pull/3135)
 */
const mutation = graphql`
  mutation DeleteEmailingCampaignMutation($input: DeleteEmailingCampaignsInput!) {
    deleteEmailingCampaigns(input: $input) {
      deletedIds
      archivedIds
      error
    }
  }
`

const commit = (variables: Variables): Promise<DeleteEmailingCampaignMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: store => {
      const { parametersConnection } = variables
      const { term, orderBy, status } = createQueryVariables(parametersConnection, true)
      const root = store.get('client:root')
      const allCountCampaignsDeleted = {
        SENT: 0,
        PLANNED: 0,
        DRAFT: 0,
      }
      const campaigns = ConnectionHandler.getConnection(root, 'DashboardCampaign_campaigns', {
        orderBy,
        term,
        status,
      })
      if (!campaigns) return
      const deletedEmailingCampaignsIds = store.getRootField('deleteEmailingCampaigns').getValue('deletedIds')
      const archivedEmailingCampaignsIds = store.getRootField('deleteEmailingCampaigns').getValue('archivedIds')
      ;[...deletedEmailingCampaignsIds, ...archivedEmailingCampaignsIds].forEach(campaignDeletedOrArchived => {
        const campaignStatusDeleted = store.get(campaignDeletedOrArchived).getValue('status')

        switch (campaignStatusDeleted) {
          case 'SENT':
            allCountCampaignsDeleted.SENT++
            break

          case 'DRAFT':
            allCountCampaignsDeleted.DRAFT++
            break

          case 'PLANNED':
            allCountCampaignsDeleted.PLANNED++
            break

          default:
            break
        }

        ConnectionHandler.deleteNode(campaigns, campaignDeletedOrArchived)
      })
      const countCampaignsDeleted = deletedEmailingCampaignsIds.length + archivedEmailingCampaignsIds.length
      // Update count
      const countCampaigns = campaigns.getValue('totalCount') as any as number
      campaigns.setValue(countCampaigns - countCampaignsDeleted, 'totalCount')
      const campaignAll = root.getLinkedRecord('emailingCampaigns', {
        status: null,
      })
      campaignAll.setValue(countCampaigns - countCampaignsDeleted, 'totalCount')
      const campaignSent = root.getLinkedRecord('emailingCampaigns', {
        status: 'SENT',
      })
      const countCampaignSent = campaignSent.getValue('totalCount')
      campaignSent.setValue(countCampaignSent - allCountCampaignsDeleted.SENT, 'totalCount')
      const campaignPlanned = root.getLinkedRecord('emailingCampaigns', {
        status: 'PLANNED',
      })
      const countCampaignPlanned = campaignPlanned.getValue('totalCount')
      campaignPlanned.setValue(countCampaignPlanned - allCountCampaignsDeleted.PLANNED, 'totalCount')
      const campaignDraft = root.getLinkedRecord('emailingCampaigns', {
        status: 'DRAFT',
      })
      const countCampaignDraft = campaignDraft.getValue('totalCount')
      campaignDraft.setValue(countCampaignDraft - allCountCampaignsDeleted.DRAFT, 'totalCount')
    },
  })

export default {
  commit,
}
