import { ButtonQuickAction, CapUIIcon, CapUIIconSize, Flex, Link, Table, Tag, Tooltip } from '@cap-collectif/ui'
import type { OpinionItem_opinion$key } from '@relay/OpinionItem_opinion.graphql'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import DeleteOpinionConfirmationModal from './DeleteOpinionConfirmationModal'
import { OPINION_URL } from './utils'

type Props = {
  opinion: OpinionItem_opinion$key
  connectionId: string
}

const FRAGMENT = graphql`
  fragment OpinionItem_opinion on Opinion {
    id
    title
    position
    published
    pinned
    trashedStatus
    updatedAt
    author {
      displayName
      adminUrl
    }
    project {
      title
      adminAlphaUrl
    }
    section {
      title
      consultation {
        title
      }
    }
    votes(first: 0) {
      totalCount
    }
  }
`

const TITLE_MAX_LENGTH = 128

const YesNoTag = ({ value }: { value: boolean }): JSX.Element => {
  const intl = useIntl()

  return value ? (
    <Tag variantColor="success" maxWidth="100%">
      <Tag.Label>{intl.formatMessage({ id: 'global.yes' })}</Tag.Label>
    </Tag>
  ) : (
    <Tag variantColor="infoGray" maxWidth="100%">
      <Tag.Label>{intl.formatMessage({ id: 'global.no' })}</Tag.Label>
    </Tag>
  )
}

const OpinionItem: React.FC<Props> = ({ opinion: opinionFragment, connectionId }) => {
  const opinion = useFragment(FRAGMENT, opinionFragment)
  const intl = useIntl()
  const editUrl = `${OPINION_URL}?id=${opinion.id}`
  const { title } = opinion

  return (
    <>
      <Table.Td>
        {title.length > TITLE_MAX_LENGTH ? (
          <Tooltip label={title}>
            <Link truncate={TITLE_MAX_LENGTH} href={editUrl}>
              {title}
            </Link>
          </Tooltip>
        ) : (
          <Link href={editUrl}>{title}</Link>
        )}
      </Table.Td>
      <Table.Td>
        {opinion.author ? <Link href={opinion.author.adminUrl}>{opinion.author.displayName}</Link> : null}
      </Table.Td>
      <Table.Td>
        {opinion.project ? <Link href={opinion.project.adminAlphaUrl}>{opinion.project.title}</Link> : null}
      </Table.Td>
      <Table.Td>{opinion.section.title}</Table.Td>
      <Table.Td>{opinion.section.consultation?.title}</Table.Td>
      <Table.Td>{opinion.votes.totalCount}</Table.Td>
      <Table.Td>{opinion.position}</Table.Td>
      <Table.Td>
        <YesNoTag value={opinion.published} />
      </Table.Td>
      <Table.Td>
        <YesNoTag value={opinion.pinned} />
      </Table.Td>
      <Table.Td>
        {opinion.trashedStatus ? (
          // Cut with an ellipsis in a narrow column, in full on hover (title set by Tag)
          <Tag variantColor="danger" maxWidth="100%">
            <Tag.Label>
              {intl.formatMessage({
                id:
                  opinion.trashedStatus === 'INVISIBLE'
                    ? 'admin.fields.proposal.state.choices.hidden_content'
                    : 'project.trash',
              })}
            </Tag.Label>
          </Tag>
        ) : null}
      </Table.Td>
      <Table.Td>
        {opinion.updatedAt
          ? intl.formatDate(opinion.updatedAt, {
              day: 'numeric',
              month: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            })
          : null}
      </Table.Td>
      <Table.Td>
        {/* The buttons wrap rather than overflowing the column on a narrow screen */}
        <Flex justifyContent="center" gap="xs" wrap="wrap">
          <ButtonQuickAction
            icon={CapUIIcon.Pencil}
            size={CapUIIconSize.Sm}
            variantColor="primary"
            label={`${intl.formatMessage({ id: 'global.edit' })} ${title}`}
            onClick={() => (window.location.href = editUrl)}
          />
          <DeleteOpinionConfirmationModal title={title} opinionId={opinion.id} connectionId={connectionId} />
        </Flex>
      </Table.Td>
    </>
  )
}

export default OpinionItem
