import * as React from 'react'
import { useIntl } from 'react-intl'
import { Tag } from '@cap-collectif/ui'
import { UserInviteStatus } from '@relay/UserInviteList_query.graphql'

const StatusTag = ({ status }: { status: UserInviteStatus | null | undefined }) => {
  const intl = useIntl()

  const statuses = {
    PENDING: {
      color: 'warning',
      messageId: 'waiting',
    },
    EXPIRED: {
      color: 'infoGray',
      messageId: 'global.expired.feminine',
    },
    FAILED: {
      color: 'danger',
      messageId: 'sending.failure',
    },
    ACCEPTED: {
      color: 'success',
      messageId: 'global.accepted.feminine',
    },
  }

  const { color, messageId } = statuses[status] || {}
  if (!color || !messageId) return

  return <Tag variantColor={color}>{intl.formatMessage({ id: messageId })}</Tag>
}

export default StatusTag
