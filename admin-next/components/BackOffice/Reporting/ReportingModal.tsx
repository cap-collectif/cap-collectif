import {
  Box,
  Button,
  ButtonGroup,
  CapUIIconSize,
  CapUIModalSize,
  Flex,
  Heading,
  Link,
  Modal,
  Spinner,
  Tag,
  Text,
} from '@cap-collectif/ui'
import type { ReportingModalQuery } from '@relay/ReportingModalQuery.graphql'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { ACTION_LABEL, ReportingAction, useModerateReporting } from './useModerateReporting'
import { CONTRIBUTION_TYPE_LABEL, getReportingTypeLabel } from './utils'

const QUERY = graphql`
  query ReportingModalQuery($id: ID!) {
    reporting(id: $id) {
      id
      type
      isArchived
      bodyText
      createdAt
      url
      author {
        displayName
        adminUrl
      }
      related {
        __typename
        ... on Opinion {
          title
          opinionText: bodyText
        }
        ... on Version {
          title
          versionText: bodyText
        }
        ... on Source {
          title
          body
        }
        ... on Proposal {
          title
          proposalText: bodyText
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
  }
`

type Props = {
  reportingId: string
  onClose: () => void
}

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <Flex direction="column" spacing={1}>
    <Text fontWeight={600}>{label}</Text>
    <Box>{children}</Box>
  </Flex>
)

const ReportingDetails: React.FC<Props> = ({ reportingId, onClose }) => {
  const intl = useIntl()
  const { reporting } = useLazyLoadQuery<ReportingModalQuery>(QUERY, { id: reportingId })
  const { moderate, pendingAction } = useModerateReporting()

  if (!reporting) {
    return (
      <Modal.Body>
        <Text>{intl.formatMessage({ id: 'no_result' })}</Text>
      </Modal.Body>
    )
  }

  const { related } = reporting
  const contributionType = related ? CONTRIBUTION_TYPE_LABEL[related.__typename] : null
  const reportingType = getReportingTypeLabel(reporting.type)
  const contributionTitle = related && 'title' in related ? related.title : null
  // Contributions without a title (argument, comment...) are displayed by their content
  const contributionText =
    related?.__typename === 'Opinion'
      ? related.opinionText
      : related?.__typename === 'Version'
      ? related.versionText
      : related?.__typename === 'Proposal'
      ? related.proposalText
      : related && 'body' in related
      ? related.body
      : null

  const onModerate = async (action: ReportingAction) => {
    if (await moderate(reporting.id, action)) onClose()
  }

  return (
    <>
      <Modal.Body>
        <Flex direction="column" spacing={4}>
          <Row label={intl.formatMessage({ id: 'global.link' })}>
            <Link href={reporting.url} target="_blank" rel="noreferrer">
              {reporting.url}
            </Link>
          </Row>
          {contributionType && (
            <Row label={intl.formatMessage({ id: 'admin.fields.reporting.type' })}>
              <Text>{intl.formatMessage({ id: contributionType })}</Text>
            </Row>
          )}
          <Row label={intl.formatMessage({ id: 'admin.fields.reporting.object' })}>
            {contributionTitle ? <Text fontWeight={600}>{contributionTitle}</Text> : null}
            {contributionText ? <Text>{contributionText}</Text> : null}
          </Row>
          {reportingType && (
            <Row label={intl.formatMessage({ id: 'admin.fields.reporting.status' })}>
              <Text>{intl.formatMessage({ id: reportingType })}</Text>
            </Row>
          )}
          <Row label={intl.formatMessage({ id: 'admin.fields.reporting.body' })}>
            <Text>{reporting.bodyText}</Text>
          </Row>
          <Row label={intl.formatMessage({ id: 'admin.fields.reporting.is_archived' })}>
            <Tag variantColor={reporting.isArchived ? 'success' : 'infoGray'}>
              {intl.formatMessage({ id: reporting.isArchived ? 'global.yes' : 'global.no' })}
            </Tag>
          </Row>
          <Row label={intl.formatMessage({ id: 'global.author' })}>
            <Link href={reporting.author.adminUrl}>{reporting.author.displayName}</Link>
          </Row>
          <Row label={intl.formatMessage({ id: 'global.creation' })}>
            <Text>
              {intl.formatDate(reporting.createdAt, {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
              })}
            </Text>
          </Row>
        </Flex>
      </Modal.Body>
      <Modal.Footer>
        <ButtonGroup>
          <Button
            variant="secondary"
            variantColor="danger"
            variantSize="big"
            isLoading={pendingAction === 'DISABLE'}
            disabled={!!pendingAction}
            onClick={() => onModerate('DISABLE')}
          >
            {intl.formatMessage({ id: ACTION_LABEL.DISABLE })}
          </Button>
          <Button
            variant="primary"
            variantColor="danger"
            variantSize="big"
            isLoading={pendingAction === 'TRASH'}
            disabled={!!pendingAction}
            onClick={() => onModerate('TRASH')}
          >
            {intl.formatMessage({ id: ACTION_LABEL.TRASH })}
          </Button>
          <Button
            variant="primary"
            variantColor="primary"
            variantSize="big"
            isLoading={pendingAction === 'ARCHIVE'}
            disabled={!!pendingAction}
            onClick={() => onModerate('ARCHIVE')}
          >
            {intl.formatMessage({ id: ACTION_LABEL.ARCHIVE })}
          </Button>
        </ButtonGroup>
      </Modal.Footer>
    </>
  )
}

const ReportingModal: React.FC<Props> = ({ reportingId, onClose }) => {
  const intl = useIntl()
  const title = intl.formatMessage({ id: 'capco.module.reporting' })

  return (
    <Modal show size={CapUIModalSize.Lg} ariaLabel={title} onClose={onClose}>
      <Modal.Header>
        <Heading>{title}</Heading>
      </Modal.Header>
      <React.Suspense
        fallback={
          <Modal.Body>
            <Flex alignItems="center" justifyContent="center">
              <Spinner size={CapUIIconSize.Xl} color="gray.150" />
            </Flex>
          </Modal.Body>
        }
      >
        <ReportingDetails reportingId={reportingId} onClose={onClose} />
      </React.Suspense>
    </Modal>
  )
}

export default ReportingModal
