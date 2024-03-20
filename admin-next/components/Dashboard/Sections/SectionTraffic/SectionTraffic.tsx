import type { FC } from 'react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { useIntl } from 'react-intl'
import TrafficChart from '@ui/Charts/TrafficChart/TrafficChart'
import Section from '@ui/Section/Section'
import { getVariablesQuery, QueryOptions } from '../Sections.utils'
import { useDashboard } from '../../Dashboard.context'
import {
  PlatformAnalyticsTrafficSourceType,
  SectionTrafficQuery as SectionTrafficQueryType,
} from '@relay/SectionTrafficQuery.graphql'
import SectionTrafficEmpty from './SectionTrafficEmpty'
import { Text } from '@cap-collectif/ui'

interface SectionTrafficProps {
  readonly queryOptions: QueryOptions
}

type Source = {
  readonly type: PlatformAnalyticsTrafficSourceType
  readonly totalCount: number
}

const QUERY = graphql`
  query SectionTrafficQuery($filter: QueryAnalyticsFilter!) {
    analytics(filter: $filter) {
      trafficSources {
        totalCount
        sources {
          type
          totalCount
        }
      }
    }
  }
`

const formatSources = (sources: ReadonlyArray<Source>, totalCount: number) =>
  sources.map(source => ({
    id: source.type,
    percentage: Math.round((source.totalCount / totalCount) * 100),
  }))

const SectionTraffic: FC<SectionTrafficProps> = ({ queryOptions }) => {
  const { filters } = useDashboard()
  const data = useLazyLoadQuery<SectionTrafficQueryType>(QUERY, getVariablesQuery(filters), queryOptions)
  const intl = useIntl()
  const { trafficSources } = data.analytics

  if (!trafficSources || trafficSources?.totalCount === 0) return <SectionTrafficEmpty />

  return (
    <Section width="50%" spacing={6} border="normal" borderColor="gray.150">
      <Text fontSize={3} color="blue.800">
        {intl.formatMessage({ id: 'traffic-source' })}
      </Text>
      <TrafficChart percentages={formatSources(trafficSources.sources, trafficSources.totalCount)} />
    </Section>
  )
}

export default SectionTraffic
