import { Link, Table, Tag, Text, Tooltip } from '@cap-collectif/ui'
import type { ProposalItem_proposal$key } from '@relay/ProposalItem_proposal.graphql'
import { pxToRem } from '@shared/utils/pxToRem'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { PUBLICATION_STATUS, STATUS_COLOR } from './utils'

const TITLE_MAX_LENGTH = 70

const FRAGMENT = graphql`
  fragment ProposalItem_proposal on Proposal {
    title
    reference(full: true)
    adminUrl
    publicationStatus
    createdAt
    updatedAt
    author {
      displayName
      ... on User {
        adminUrl
      }
    }
    updatedBy {
      displayName
      adminUrl
    }
    project {
      title
      adminAlphaUrl
    }
    category {
      name
    }
    district {
      name
    }
    lastStatus {
      name
      color
    }
  }
`

type Props = {
  proposal: ProposalItem_proposal$key
}

const ProposalItem: React.FC<Props> = ({ proposal: fragmentKey }) => {
  const intl = useIntl()
  const proposal = useFragment(FRAGMENT, fragmentKey)
  const publicationStatus =
    proposal.publicationStatus !== '%future added value' ? PUBLICATION_STATUS[proposal.publicationStatus] : null
  const statusColor =
    proposal.lastStatus && proposal.lastStatus.color !== '%future added value'
      ? STATUS_COLOR[proposal.lastStatus.color]
      : 'infoGray'
  const formatDate = (date: string) =>
    intl.formatDate(date, { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' })

  const titleLink = proposal.adminUrl ? (
    <Link truncate={TITLE_MAX_LENGTH} href={proposal.adminUrl}>
      {proposal.title}
    </Link>
  ) : (
    <Text truncate={TITLE_MAX_LENGTH}>{proposal.title}</Text>
  )

  return (
    <>
      <Table.Td minWidth={pxToRem(120)}>{proposal.reference}</Table.Td>
      <Table.Td>
        {proposal.title.length > TITLE_MAX_LENGTH ? <Tooltip label={proposal.title}>{titleLink}</Tooltip> : titleLink}
      </Table.Td>
      <Table.Td>
        {proposal.author.adminUrl ? (
          <Link href={proposal.author.adminUrl}>{proposal.author.displayName}</Link>
        ) : (
          proposal.author.displayName
        )}
      </Table.Td>
      <Table.Td>
        {proposal.project ? <Link href={proposal.project.adminAlphaUrl}>{proposal.project.title}</Link> : null}
      </Table.Td>
      <Table.Td>{proposal.category?.name}</Table.Td>
      <Table.Td>{proposal.district?.name}</Table.Td>
      <Table.Td>
        {proposal.lastStatus ? <Tag variantColor={statusColor}>{proposal.lastStatus.name}</Tag> : null}
      </Table.Td>
      <Table.Td>
        {publicationStatus ? (
          <Tag variantColor={publicationStatus.color}>{intl.formatMessage({ id: publicationStatus.label })}</Tag>
        ) : null}
      </Table.Td>
      <Table.Td>{formatDate(proposal.createdAt)}</Table.Td>
      <Table.Td>
        {proposal.updatedAt ? formatDate(proposal.updatedAt) : null}
        {proposal.updatedBy ? (
          <Text>
            {intl.formatMessage({ id: 'global.written_by' })}{' '}
            <Link href={proposal.updatedBy.adminUrl}>{proposal.updatedBy.displayName}</Link>
          </Text>
        ) : null}
      </Table.Td>
    </>
  )
}

export default ProposalItem
