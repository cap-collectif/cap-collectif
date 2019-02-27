// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import type { EventStatusFilter_query } from './__generated__/EventStatusFilter_query.graphql';

type Props = {
  query: EventStatusFilter_query,
  overlay: React.Element<*>,
  status: ?string
};

export class EventStatusFilter extends React.Component<Props> {
  render() {
    const { query, overlay } = this.props;
    return (
      <>
        <FormattedMessage
          id="number-of-events"
          values={{
            num: query.events.totalCount,
          }}
        />
        <OverlayTrigger
        trigger="click"
        placement="bottom"
        aria-describedby=""
        overlay={
          <Popover id="FiltersContainer" className="w-260" rel="">
            {overlay}
          </Popover>
        }>
          <Button bsStyle="link">
            {status === 'all' ? (
              <FormattedMessage id="all-events" />
            ) : (
              <FormattedMessage id="all-events" />
            )}
          </Button>
        </OverlayTrigger>
        
      </>
    )
      
    
  }
}

export default createFragmentContainer(EventStatusFilter, {
  query: graphql`
    fragment EventStatusFilter_query on Query
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
