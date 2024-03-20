import type { FC } from 'react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { useIntl } from 'react-intl'
import { useDisclosure } from '@liinkiing/react-hooks'
import SmallChart from '@ui/Charts/SmallChart/SmallChart'
import formatValues from '../../formatValues'
import ModalSectionPageViews from './ModalSectionPageViews'
import { Box } from '@cap-collectif/ui'
import { useDashboard } from '../../Dashboard.context'
import { SectionPageViewsQuery as SectionPageViewsQueryType } from '@relay/SectionPageViewsQuery.graphql'
import { getVariablesQuery, QueryOptions } from '../Sections.utils'

interface SectionPageViewsProps {
  readonly queryOptions: QueryOptions
}

const QUERY = graphql`
  query SectionPageViewsQuery($filter: QueryAnalyticsFilter!) {
    analytics(filter: $filter) {
      pageViews {
        totalCount
        values {
          key
          totalCount
        }
        ...ModalSectionPageViews_pageViews
      }
    }
  }
`

const SectionPageViews: FC<SectionPageViewsProps> = ({ queryOptions }) => {
  const { filters } = useDashboard()
  const data = useLazyLoadQuery<SectionPageViewsQueryType>(QUERY, getVariablesQuery(filters), queryOptions)
  const intl = useIntl()
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const { pageViews } = data.analytics

  return (
    <>
      <Box as="button" type="button" onClick={onOpen} flex={1} maxWidth="33%">
        <SmallChart
          count={pageViews?.totalCount || 0}
          label={intl.formatMessage({ id: 'global.page.views.dynamic' }, { num: pageViews?.totalCount || 0 })}
          data={pageViews ? formatValues(pageViews.values, intl) : []}
        />
      </Box>

      {pageViews && <ModalSectionPageViews show={isOpen} onClose={onClose} pageViews={pageViews} />}
    </>
  )
}

export default SectionPageViews
