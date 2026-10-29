import { GetServerSideProps } from 'next'
import { withFeatureFlagRequired } from '@utils/withPageAuthRequired'
import type { EmailingCampaignStatus } from '@relay/EmailingCampaignItem_emailingCampaign.graphql'

export const CONNECTION_NODES_PER_PAGE = 30
export const MEMBERS_PER_PAGE = 20

export const MAILING_LISTS_URL = '/admin-next/mailing-lists'
export const EMAILING_CAMPAIGNS_URL = '/admin-next/emailing-campaigns'
export const getEmailingCampaignUrl = (id: string) => `/admin-next/emailing-campaign?id=${id}`

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

// The emailing pages are only reachable when the `emailing` feature is enabled
export const withEmailingPageRequired: GetServerSideProps = withFeatureFlagRequired('emailing', '/')
