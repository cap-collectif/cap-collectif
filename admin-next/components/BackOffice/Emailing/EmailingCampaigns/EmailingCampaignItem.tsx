import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { Link, Table, Tag } from '@cap-collectif/ui'
import type { EmailingCampaignItem_emailingCampaign$key } from '@relay/EmailingCampaignItem_emailingCampaign.graphql'
import { getCampaignStatus, getEmailingCampaignUrl, INTERNAL_LIST_REGISTERED } from '../utils'

const FRAGMENT = graphql`
  fragment EmailingCampaignItem_emailingCampaign on EmailingCampaign {
    id
    name
    sendAt
    status
    mailingInternal
    mailingList {
      name
    }
    emailingGroup {
      title
    }
    project {
      title
    }
  }
`

type Props = {
  readonly emailingCampaign: EmailingCampaignItem_emailingCampaign$key
}

const EmailingCampaignItem: React.FC<Props> = ({ emailingCampaign: emailingCampaignRef }) => {
  const intl = useIntl()
  const campaign = useFragment(FRAGMENT, emailingCampaignRef)
  const status = getCampaignStatus(campaign.status)
  const recipient =
    campaign.mailingList?.name ??
    campaign.emailingGroup?.title ??
    campaign.project?.title ??
    (campaign.mailingInternal === INTERNAL_LIST_REGISTERED ? intl.formatMessage({ id: 'users' }) : null)

  return (
    <>
      <Table.Td>
        <Link href={getEmailingCampaignUrl(campaign.id)} truncate={128}>
          {campaign.name}
        </Link>
      </Table.Td>
      <Table.Td>
        <Tag variantColor={status.color}>{intl.formatMessage({ id: status.label })}</Tag>
      </Table.Td>
      <Table.Td>
        {campaign.sendAt
          ? intl.formatDate(campaign.sendAt, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            })
          : null}
      </Table.Td>
      <Table.Td>{recipient}</Table.Td>
    </>
  )
}

export default EmailingCampaignItem
