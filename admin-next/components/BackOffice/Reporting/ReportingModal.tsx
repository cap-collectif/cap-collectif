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
import { CONTRIBUTION_TYPE_LABEL, getReportingState, getReportingTypeLabel } from './utils'

const QUERY = graphql`
  query ReportingModalQuery($id: ID!) {
    reporting(id: $id) {
      id
      type
      isArchived
      bodyText
      createdAt
      url
      relatedAdminUrl
      author {
        displayName
        adminUrl
      }
      related {
        __typename
        ... on Trashable {
          trashedStatus
        }
        # Aliased where the author type differs: fields of different shapes cannot share a response name
        ... on ContributionWithAuthor {
          author {
            displayName
            adminUrl
          }
        }
        ... on DebateArgument {
          author {
            displayName
            adminUrl
          }
        }
        ... on Proposal {
          # A participant has no account, hence no admin page
          proposalAuthor: author {
            displayName
            ... on User {
              adminUrl
            }
          }
        }
        ... on Comment {
          # Null for an anonymous comment, identified by authorName
          commentAuthor: author {
            displayName
            adminUrl
          }
          authorName
        }
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
          # Comment exposes trashedStatus without implementing Trashable
          trashedStatus
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
  const state = getReportingState(reporting.isArchived, related?.trashedStatus)
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
  // Contributors without an account (participant, anonymous comment) have no admin page: no link
  const contributionAuthor =
    related?.__typename === 'Proposal'
      ? { name: related.proposalAuthor.displayName, adminUrl: related.proposalAuthor.adminUrl }
      : related?.__typename === 'Comment'
      ? related.commentAuthor
        ? { name: related.commentAuthor.displayName, adminUrl: related.commentAuthor.adminUrl }
        : { name: related.authorName, adminUrl: null }
      : related && 'author' in related
      ? { name: related.author.displayName, adminUrl: related.author.adminUrl }
      : null
  // Back office page of the contribution, or its public page when it has none (e.g. a debate argument)
  const contributionUrl = reporting.relatedAdminUrl ?? reporting.url

  const onModerate = async (action: ReportingAction) => {
    if (await moderate(reporting.id, action)) onClose()
  }

  return (
    <>
      <Modal.Body>
        <Flex direction="column" spacing={4}>
          <Row label={intl.formatMessage({ id: 'global.link' })}>
            <Link href={contributionUrl} target="_blank" rel="noreferrer">
              {contributionUrl}
            </Link>
          </Row>
          {contributionType && (
            <Row label={intl.formatMessage({ id: 'admin.fields.reporting.type' })}>
              <Text>{intl.formatMessage({ id: contributionType })}</Text>
            </Row>
          )}
          {contributionAuthor?.name && (
            <Row label={intl.formatMessage({ id: 'admin.reporting.contribution-author' })}>
              {contributionAuthor.adminUrl ? (
                <Link href={contributionAuthor.adminUrl}>{contributionAuthor.name}</Link>
              ) : (
                <Text>{contributionAuthor.name}</Text>
              )}
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
          <Row label={intl.formatMessage({ id: 'global.state' })}>
            <Tag variantColor={state.color}>{intl.formatMessage({ id: state.label })}</Tag>
          </Row>
          <Row label={intl.formatMessage({ id: 'admin.reporting.author' })}>
            <Link href={reporting.author.adminUrl}>{reporting.author.displayName}</Link>
          </Row>
          <Row label={intl.formatMessage({ id: 'global.date.text' })}>
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
            isLoading={pendingAction === 'TRASH'}
            disabled={!!pendingAction}
            onClick={() => onModerate('TRASH')}
          >
            {intl.formatMessage({ id: ACTION_LABEL.TRASH })}
          </Button>
          <Button
            variant="primary"
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
