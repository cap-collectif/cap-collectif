import * as React from 'react'
import type { IntlShape } from 'react-intl'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import moment from 'moment'
import type { ReplyItem_reply$key, ReplyItem_reply } from '~relay/ReplyItem_reply.graphql'
import ReplyModalConfirmationDelete from './ReplyModalConfirmationDelete'
import { ReplyItem_viewer$key } from '~relay/ReplyItem_viewer.graphql'
import { ButtonQuickAction, CapUIIcon, Flex, Link, Table, Tag, Text } from '@cap-collectif/ui'
type Props = {
  readonly reply: ReplyItem_reply$key
  readonly viewer: ReplyItem_viewer$key
  readonly connectionName: string
}
const REPLY_FRAGMENT = graphql`
  fragment ReplyItem_reply on Reply {
    __typename
    id
    createdAt
    updatedAt
    status
    adminUrl
    ... on UserReply {
      author {
        username
      }
    }
  }
`

const VIEWER_FRAGMENT = graphql`
  fragment ReplyItem_viewer on User {
    isOrganizationMember
  }
`

const StatusTag = ({ reply, intl }: { reply: ReplyItem_reply; intl: IntlShape }) => {
  let variant = null
  let message = null

  switch (reply.status) {
    case 'DRAFT':
      variant = 'gray'
      message = 'global-draft'
      break

    case 'PUBLISHED':
      variant = 'green'
      message = 'global.published'
      break

    case 'PENDING':
      variant = 'orange'
      message = 'waiting'
      break

    case 'NOT_PUBLISHED':
      variant = 'red'
      message = 'global.no.published'
      break

    default:
      return null
  }

  return (
    <Tag variantColor={variant}>
      {intl.formatMessage({
        id: message,
      })}
    </Tag>
  )
}

const getUsername = (reply: ReplyItem_reply, intl: IntlShape): string | null | undefined => {
  if (reply.__typename === 'AnonymousReply') {
    return intl.formatMessage({
      id: 'no-account-user',
    })
  }

  if (reply.author?.username === 'deleted-user') {
    return intl.formatMessage({
      id: 'deleted-user',
    })
  }

  if (reply.author?.username) {
    return reply.author.username
  }

  return null
}

const ReplyItem = ({ reply: replyFragment, connectionName, viewer: viewerFragment }: Props): JSX.Element => {
  const reply = useFragment(REPLY_FRAGMENT, replyFragment)
  const viewer = useFragment(VIEWER_FRAGMENT, viewerFragment)
  const intl = useIntl()
  const author = getUsername(reply, intl)
  const id = moment(reply.createdAt).format('YYYY-MM-DD_H-m-s')
  return (
    <>
      <Table.Td>
        {reply.adminUrl && !viewer.isOrganizationMember ? (
          <Link href={reply.adminUrl} target="_blank">
            {id}
          </Link>
        ) : (
          id
        )}
      </Table.Td>
      <Table.Td>{author}</Table.Td>
      <Table.Td>
        <StatusTag reply={reply} intl={intl} />
      </Table.Td>
      <Table.Td>
        {intl.formatDate(reply.updatedAt, {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
        })}
      </Table.Td>
      <Table.Td>
        <Flex>
          <Text>
            {intl.formatDate(reply.createdAt, {
              day: 'numeric',
              month: 'numeric',
              year: 'numeric',
            })}
          </Text>
          <Text color="gray.400" ml={2}>
            {intl.formatDate(reply.createdAt, {
              hour: 'numeric',
              minute: 'numeric',
            })}
          </Text>
        </Flex>
      </Table.Td>
      <Table.Td visibleOnHover>
        <ReplyModalConfirmationDelete
          replyIds={[reply.id]}
          connectionName={connectionName}
          disclosure={
            <ButtonQuickAction
              icon={CapUIIcon.Trash}
              label={intl.formatMessage({
                id: 'global.delete',
              })}
              variantColor="danger"
            />
          }
        />
      </Table.Td>
    </>
  )
}

export default ReplyItem
