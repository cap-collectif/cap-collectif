import type { ProposalPublicationStatus, ProposalStepStatusColor } from '@relay/ProposalItem_proposal.graphql'

export const CONNECTION_NODES_PER_PAGE = 20

type TagColor = 'info' | 'infoGray' | 'success' | 'warning' | 'danger'

// Same colors as the former Sonata list labels
export const PUBLICATION_STATUS: Record<
  Exclude<ProposalPublicationStatus, '%future added value'>,
  { label: string; color: TagColor }
> = {
  PUBLISHED: { label: 'global.published', color: 'success' },
  DRAFT: { label: 'proposal.state.draft', color: 'info' },
  UNPUBLISHED: { label: 'admin.fields.proposal.state.choices.unpublished', color: 'infoGray' },
  ARCHIVED: { label: 'global-archived', color: 'infoGray' },
  TRASHED: { label: 'project.trash', color: 'danger' },
  TRASHED_NOT_VISIBLE: { label: 'admin.fields.proposal.state.choices.hidden_content', color: 'danger' },
  DELETED: { label: 'global.deleted', color: 'danger' },
}

export const STATUS_COLOR: Record<Exclude<ProposalStepStatusColor, '%future added value'>, TagColor> = {
  INFO: 'info',
  PRIMARY: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  CAUTION: 'warning',
  DANGER: 'danger',
  DEFAULT: 'infoGray',
}
