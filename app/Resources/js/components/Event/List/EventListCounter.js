// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import type { EventListCounter_query } from './__generated__/EventListCounter_query.graphql';

type Props = {
  query: EventListCounter_query,
};

export class EventListCounter extends React.Component<Props> {
  render() {
    const { query } = this.props;
    return query.events.totalCount === query.eventsWithoutFilters.totalCount ? (
      <FormattedMessage
        id="number-of-events"
        values={{
          num: query.events.totalCount,
        }}
      />
    ) : (
      <FormattedMessage
        id="n-of-n-events"
        values={{
          filteredCount: query.events.totalCount,
          totalCount: query.eventsWithoutFilters.totalCount,
        }}
      />
    );
  }
}

export default createFragmentContainer(EventListCounter, {
  query: graphql`
    fragment EventListCounter_query on Query
      @argumentDefinitions(
        count: { type: "Int!" }
        cursor: { type: "String" }
        theme: { type: "ID" }
        project: { type: "ID" }
        search: { type: "String" }
        userType: { type: "ID" }
        isFuture: { type: "Boolean" }
      ) {
      events(
        first: $count
        after: $cursor
        theme: $theme
        project: $project
        search: $search
        userType: $userType
        isFuture: $isFuture
      ) @connection(key: "EventListPaginated_events", filters: []) {
        edges {
          node {
            id
          }
        }
        totalCount
      }
      eventsWithoutFilters: events {
        totalCount
      }
    }
  `,
});
