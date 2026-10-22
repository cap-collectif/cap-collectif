import { GetServerSideProps } from 'next'
import { withFeatureFlagRequired } from '@utils/withPageAuthRequired'
import type { EmailingCampaignStatus } from '@relay/EmailingCampaignItem_emailingCampaign.graphql'

export const CONNECTION_NODES_PER_PAGE = 30
export const MEMBERS_PER_PAGE = 20

export const MAILING_LISTS_URL = '/admin-next/mailing-lists'
export const EMAILING_CAMPAIGNS_URL = '/admin-next/emailing-campaigns'
export const getEmailingCampaignUrl = (id: string) => `/admin-next/emailing-campaign?id=${id}`

// Sonata routes retained during the Admin Next migration rollout. Remove them with the migration feature flag.
export const SONATA_MAILING_LISTS_URL = '/admin/mailingList/list'
export const SONATA_EMAILING_CAMPAIGNS_URL = '/admin/mailingCampaign/list'

export const HELP_CENTER_LINK_KEY = 'admin.help.link.emailing'

// The only internal list that can be picked as recipient (admins only)
export const INTERNAL_LIST_REGISTERED = 'REGISTERED'

export const CAMPAIGN_STATUS: Record<
  Exclude<EmailingCampaignStatus, '%future added value'>,
  { label: string; color: 'success' | 'warning' | 'infoGray' }
> = {
  SENT: { label: 'global-sent', color: 'success' },
  SENDING: { label: 'global-sent', color: 'success' },
  PLANNED: { label: 'global-planned', color: 'warning' },
  DRAFT: { label: 'global-draft', color: 'infoGray' },
  ARCHIVED: { label: 'global-archived', color: 'infoGray' },
}

export const getCampaignStatus = (status: EmailingCampaignStatus) =>
  CAMPAIGN_STATUS[status as keyof typeof CAMPAIGN_STATUS] ?? CAMPAIGN_STATUS.DRAFT

export const DATE_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
}

/**
 * The emailing pages are only reachable when the `emailing` feature is enabled, and during the rollout,
 * when the migration feature flag is enabled (otherwise the Sonata page is served).
 */
export const withEmailingPageRequired = (sonataUrl: string): GetServerSideProps => {
  const withMigrationFlag = withFeatureFlagRequired('unstable__sonata_migration_to_admin_next', sonataUrl)

  return async context => {
    const result = await withMigrationFlag(context)

    if ('props' in result && 'featureFlags' in result.props && !result.props.featureFlags.emailing) {
      return { redirect: { destination: '/', permanent: false } }
    }

    return result
  }
}
