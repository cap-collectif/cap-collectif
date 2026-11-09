import { GetServerSideProps } from 'next'
import { fromGlobalId } from '@shared/utils/fromGlobalId'
import { withFeatureFlagRequired } from '@utils/withPageAuthRequired'

export const CONNECTION_NODES_PER_PAGE = 20

export const OPINIONS_URL = '/admin-next/opinions'

export const OPINION_URL = '/admin-next/opinion'

export const EXPORT_URL = '/export-opinions'

// Select value standing for "not in the trash", react-select options cannot hold null
export const NOT_TRASHED = 'NONE'

// Appendix fields are registered as `appendix-${appendixTypeId}`: a dotted path would build an array for numeric ids
export const getAppendixFieldName = (appendixTypeId: string): string => `appendix-${appendixTypeId}`

// Sonata routes retained during the Admin Next migration rollout. Remove them with the migration feature flag.
export const SONATA_OPINION_LIST_URL = '/admin/capco/app/opinion/list'
const getSonataOpinionUrl = (opinionGlobalId: string, opinionTypeId: string): string => {
  const opinionUuid = opinionGlobalId ? fromGlobalId(opinionGlobalId).id : ''
  if (opinionUuid) return `/admin/capco/app/opinion/${encodeURIComponent(opinionUuid)}/edit`
  if (opinionTypeId) return `/admin/capco/app/opinion/create?opinion_type=${encodeURIComponent(opinionTypeId)}`

  return SONATA_OPINION_LIST_URL
}

/**
 * During the rollout, the page is only reachable when the migration feature flag is enabled,
 * otherwise the viewer is sent back to the matching Sonata edit or creation page.
 */
export const withOpinionAdminPageRequired: GetServerSideProps = async context => {
  const opinionId = typeof context.query.id === 'string' ? context.query.id : ''
  const opinionTypeId = typeof context.query.opinionTypeId === 'string' ? context.query.opinionTypeId : ''

  return withFeatureFlagRequired(
    'unstable__sonata_migration_to_admin_next',
    getSonataOpinionUrl(opinionId, opinionTypeId),
  )(context)
}
