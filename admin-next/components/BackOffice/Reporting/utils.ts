import type { ReportingType, TrashableStatus } from '@relay/ReportingItem_reporting.graphql'

export const CONNECTION_NODES_PER_PAGE = 50

// Translation key of the reported contribution type, by GraphQL type name (same labels as the Sonata page)
export const CONTRIBUTION_TYPE_LABEL: Record<string, string> = {
  Opinion: 'admin.fields.reporting.opinion',
  Version: 'global.version',
  Source: 'admin.fields.reporting.source',
  Argument: 'global.argument.label',
  Comment: 'global.comment',
  Proposal: 'admin.fields.reporting.proposal',
  DebateArgument: 'admin.fields.reporting.debateArgument',
}

type KnownReportingType = Exclude<ReportingType, '%future added value'>

// Translation key of the problem chosen by the reporter (Reporting::$statusesLabels)
const REPORTING_TYPE_LABEL: Record<KnownReportingType, string> = {
  SEX: 'reporting.status.sexual',
  OFF: 'reporting.status.offending',
  SPAM: 'reporting.status.spam',
  ERROR: 'reporting.status.error',
  OFF_TOPIC: 'reporting.status.off_topic',
}

// Null for a value added to the GraphQL enum after the Relay types were generated
export const getReportingTypeLabel = (type: ReportingType): string | null =>
  type in REPORTING_TYPE_LABEL ? REPORTING_TYPE_LABEL[type as KnownReportingType] : null

type RelatedContribution = {
  readonly __typename: string
  readonly title?: string
  readonly body?: string
} | null

// Contributions without a title (argument, comment...) are displayed by their content
export const getContributionLabel = (related: RelatedContribution | undefined): string =>
  related?.title ?? related?.body ?? ''

type ReportingState = { label: string; color: 'success' | 'warning' | 'danger' }

// Current state of the reported contribution, derived from the reporting and the contribution itself.
// A trashed contribution wins over a pending reporting: it may have been trashed through another reporting.
export const getReportingState = (
  isArchived: boolean,
  trashedStatus: TrashableStatus | null | undefined,
): ReportingState => {
  if (trashedStatus === 'INVISIBLE') return { label: 'proposal.state.hidden_content', color: 'danger' }
  if (trashedStatus === 'VISIBLE') return { label: 'project.trash', color: 'danger' }
  if (isArchived) return { label: 'global.published', color: 'success' }

  return { label: 'waiting', color: 'warning' }
}
