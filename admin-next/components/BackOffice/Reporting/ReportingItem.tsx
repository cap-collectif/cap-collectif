import {
  Box,
  ButtonGroup,
  ButtonQuickAction,
  CapUIIcon,
  CapUIIconSize,
  Flex,
  Link,
  Table,
  Tag,
} from '@cap-collectif/ui'
import type { ReportingItem_reporting$key } from '@relay/ReportingItem_reporting.graphql'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import ModerateReportingConfirmationModal, { ConfirmableReportingAction } from './ModerateReportingConfirmationModal'
import { ACTION_LABEL } from './useModerateReporting'
import { CONTRIBUTION_TYPE_LABEL, getContributionLabel, getReportingTypeLabel } from './utils'

const CONTRIBUTION_LABEL_MAX_LENGTH = 100

const FRAGMENT = graphql`
  fragment ReportingItem_reporting on Reporting {
    id
    type
    isArchived
    createdAt
    author {
      username
      adminUrl
    }
    related {
      __typename
      ... on Opinion {
        title
      }
      ... on Version {
        title
      }
      ... on Source {
        title
      }
      ... on Proposal {
        title
      }
      ... on Argument {
        body
      }
      ... on Comment {
        body
      }
      ... on DebateArgument {
        body
      }
    }
  }
`

type Props = {
  reporting: ReportingItem_reporting$key
  onShow: (id: string) => void
}

const ReportingItem: React.FC<Props> = ({ reporting: fragmentKey, onShow }) => {
  const intl = useIntl()
  const reporting = useFragment(FRAGMENT, fragmentKey)
  const [confirmAction, setConfirmAction] = React.useState<ConfirmableReportingAction | null>(null)
  const contributionLabel = getContributionLabel(reporting.related)
  const contributionType = reporting.related ? CONTRIBUTION_TYPE_LABEL[reporting.related.__typename] : null
  const reportingType = getReportingTypeLabel(reporting.type)
  const isTruncated = contributionLabel.length > CONTRIBUTION_LABEL_MAX_LENGTH
  const truncatedLabel = isTruncated
    ? `${contributionLabel.slice(0, CONTRIBUTION_LABEL_MAX_LENGTH)}…`
    : contributionLabel

  return (
    <>
      <Table.Td>
        {/* A button, not a link: it opens the details modal instead of navigating. Table.Tr and Table.Td only
            style links (underlined when the row is hovered, primary when hovered): reproduced here */}
        <Box
          as="button"
          type="button"
          title={isTruncated ? contributionLabel : undefined}
          onClick={() => onShow(reporting.id)}
          textAlign="left"
          sx={{ '.cap-table__tr:hover &': { textDecoration: 'underline' }, '&:hover': { color: 'primary.base' } }}
        >
          {truncatedLabel}
        </Box>
      </Table.Td>
      <Table.Td>{contributionType ? intl.formatMessage({ id: contributionType }) : null}</Table.Td>
      <Table.Td>{reportingType ? intl.formatMessage({ id: reportingType }) : null}</Table.Td>
      <Table.Td>
        <Tag variantColor={reporting.isArchived ? 'success' : 'infoGray'}>
          {intl.formatMessage({ id: reporting.isArchived ? 'global.yes' : 'global.no' })}
        </Tag>
      </Table.Td>
      <Table.Td>
        <Link href={reporting.author.adminUrl}>{reporting.author.username}</Link>
      </Table.Td>
      <Table.Td>
        {intl.formatDate(reporting.createdAt, {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        })}
      </Table.Td>
      <Table.Td>
        <Flex justifyContent="center">
          <ButtonGroup>
            <ButtonQuickAction
              icon={CapUIIcon.Trash}
              size={CapUIIconSize.Md}
              variantColor="danger"
              label={intl.formatMessage({ id: ACTION_LABEL.TRASH })}
              onClick={() => setConfirmAction('TRASH')}
            />
            <ButtonQuickAction
              icon={CapUIIcon.EyeClose}
              size={CapUIIconSize.Md}
              variantColor="danger"
              label={intl.formatMessage({ id: ACTION_LABEL.DISABLE })}
              onClick={() => setConfirmAction('DISABLE')}
            />
          </ButtonGroup>
        </Flex>
        {confirmAction && (
          <ModerateReportingConfirmationModal
            reportingId={reporting.id}
            action={confirmAction}
            contributionLabel={contributionLabel}
            onClose={() => setConfirmAction(null)}
          />
        )}
      </Table.Td>
    </>
  )
}

export default ReportingItem
