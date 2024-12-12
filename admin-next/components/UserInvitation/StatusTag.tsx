import * as React from 'react'
import { useIntl } from 'react-intl'
import { Tag } from '@cap-collectif/ui'
import { UserInviteStatus } from '@relay/UserInviteList_query.graphql'

const StatusTag = ({ status }: { status: UserInviteStatus | null | undefined }) => {
  const intl = useIntl()

  const statuses = {
    PENDING: {
      color: 'orange',
      messageId: 'waiting',
    },
    EXPIRED: {
      color: 'gray',
      messageId: 'global.expired.feminine',
    },
    FAILED: {
      color: 'red',
      messageId: 'sending.failure',
    },
    ACCEPTED: {
      color: 'green',
      messageId: 'global.accepted.feminine',
    },
  }

  const { color, messageId } = statuses[status] || {}
  if (!color || !messageId) return

  return <Tag variantColor={color}>{intl.formatMessage({ id: messageId })}</Tag>
}

export default StatusTag
