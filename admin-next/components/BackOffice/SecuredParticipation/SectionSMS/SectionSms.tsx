import { graphql, useLazyLoadQuery } from 'react-relay'
import { useAppContext } from '../../AppProvider/App.context'
import SectionSmsTarification from './SectionSmsTarification'
import SectionSmsPresentation from './SectionSmsPresentation'
import type { SectionSmsQuery } from '@relay/SectionSmsQuery.graphql'

const QUERY = graphql`
  query SectionSmsQuery($filter: SmsOrdersFilters!) {
    smsOrdersProcessed: smsOrders(filter: $filter) {
      totalCount
    }
    ...SectionSmsTarification_query
  }
`

const SectionSms = () => {
  const query = useLazyLoadQuery<SectionSmsQuery>(QUERY, { filter: 'PROCESSED' })
  const { viewerSession } = useAppContext()

  if (viewerSession.isSuperAdmin || query.smsOrdersProcessed.totalCount > 0) {
    return <SectionSmsTarification query={query} />
  }

  return <SectionSmsPresentation />
}

export default SectionSms
