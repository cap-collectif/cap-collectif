import { graphql, createFragmentContainer } from 'react-relay'
import { useIntl } from 'react-intl'
import type { EventListCounter_query$data } from '~relay/EventListCounter_query.graphql'

export const EventListCounter = ({ query, status }: { query: EventListCounter_query$data; status: string }) => {
  const intl = useIntl()

  return intl.formatMessage(
    { id: 'number-of-events' },
    {
      num:
        status === 'ongoing-and-future'
          ? query.eventsFuture.totalCount
          : status === 'finished'
          ? query.eventsPast.totalCount
          : query.eventsWithoutFilters.totalCount,
    },
  )
}
export default createFragmentContainer(EventListCounter, {
  query: graphql`
    fragment EventListCounter_query on Query {
      eventsWithoutFilters: events {
        totalCount
      }
      eventsFuture: events(isFuture: true) {
        totalCount
      }
      eventsPast: events(isFuture: false) {
        totalCount
      }
    }
  `,
})
