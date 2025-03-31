import type { FC } from 'react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { useIntl } from 'react-intl'
import Section from '@ui/Section/Section'
import TabsChart from '@ui/Charts/TabsChart/TabsChart'
import formatValues from '../../formatValues'
import { getVariablesQuery, QueryOptions } from '../Sections.utils'
import { useDashboard } from '../../Dashboard.context'
import type { SectionParticipationsQuery as SectionParticipationsQueryType } from '@relay/SectionParticipationsQuery.graphql'
import { CapUIFontSize, Text } from '@cap-collectif/ui'

interface SectionParticipationsProps {
  readonly queryOptions: QueryOptions
}

const QUERY = graphql`
  query SectionParticipationsQuery($filter: QueryAnalyticsFilter!) {
    analytics(filter: $filter) {
      votes {
        totalCount
        values {
          key
          totalCount
        }
      }
      comments {
        totalCount
        values {
          key
          totalCount
        }
      }
      contributions {
        totalCount
        values {
          key
          totalCount
        }
      }
      followers {
        totalCount
        values {
          key
          totalCount
        }
      }
    }
  }
`

const SectionParticipations: FC<SectionParticipationsProps> = ({ queryOptions }) => {
  const { filters } = useDashboard()
  const data = useLazyLoadQuery<SectionParticipationsQueryType>(QUERY, getVariablesQuery(filters), queryOptions)
  const intl = useIntl()
  const { votes, comments, contributions, followers } = data.analytics

  return (
    <Section width="50%" spacing={6} border="normal" borderColor="gray.150">
      <Text fontSize={CapUIFontSize.BodyRegular} color="blue.800">
        {intl.formatMessage({ id: 'methods-of-participation' })}
      </Text>

      <TabsChart>
        <TabsChart.Tab
          id="vote"
          label={intl.formatMessage({ id: 'vote-plural' }, { num: votes?.totalCount ?? 0 })}
          count={votes?.totalCount ?? 0}
          disabled={votes?.totalCount === 0 ?? true}
          data={votes ? formatValues(votes.values, intl) : []}
        />
        <TabsChart.Tab
          id="comment"
          label={intl.formatMessage({ id: 'comment.dynamic' }, { num: comments?.totalCount ?? 0 })}
          count={comments?.totalCount ?? 0}
          disabled={comments?.totalCount === 0 ?? true}
          data={comments ? formatValues(comments.values, intl) : []}
        />
        <TabsChart.Tab
          id="contribution"
          label={intl.formatMessage({ id: 'contribution-plural' }, { num: contributions?.totalCount ?? 0 })}
          count={contributions?.totalCount ?? 0}
          disabled={contributions?.totalCount === 0 ?? true}
          data={contributions ? formatValues(contributions.values, intl) : []}
        />
        <TabsChart.Tab
          id="follower"
          label={intl.formatMessage({ id: 'subscription.dynamic' }, { num: followers?.totalCount ?? 0 })}
          count={followers?.totalCount ?? 0}
          disabled={followers?.totalCount === 0 ?? true}
          data={followers ? formatValues(followers.values, intl) : []}
        />
      </TabsChart>
    </Section>
  )
}

export default SectionParticipations
