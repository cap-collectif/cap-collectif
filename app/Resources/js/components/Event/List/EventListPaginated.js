// @flow
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Row, Col } from 'react-bootstrap';
import { formValueSelector } from 'redux-form';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import classNames from 'classnames';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { useWindowWidth } from '../../../utils/hooks/useWindowWidth';
import EventPreview from '../EventPreview';
import EventMap from '../Map/EventMap';
import EventPagePassedEventsPreview from './EventPagePassedEventsPreview';
import type { EventListPaginated_query } from '~relay/EventListPaginated_query.graphql';
import type { GlobalState, Dispatch, FeatureToggles } from '../../../types';
import { changeEventSelected } from '../../../redux/modules/event';
import sizes from '../../../utils/sizes';

type OwnProps = {|
  query: EventListPaginated_query,
  relay: RelayPaginationProp,
|};

type Props = {|
  ...OwnProps,
  eventSelected: ?string,
  dispatch: Dispatch,
  features: FeatureToggles,
  isMobileListView: boolean,
  status: string,
|};

const EVENTS_PAGINATION = 100;

const MapContainer = styled(Col)`
  top: 150px;
  position: sticky;

  @media screen and (max-width: 991px) {
    top: 0;
  }
`;

export const EventListPaginated = (props: Props) => {
  const { status, query, relay, eventSelected, features, dispatch, isMobileListView } = props;
  const [loading, setLoading] = useState(false);
  const screenWidth = useWindowWidth();

  const onFocus = (eventId: string) => {
    if (features.display_map) {
      dispatch(changeEventSelected(eventId));
    }
  };

  const shouldRenderToggleListOrMap = (component: 'list' | 'map'): boolean => {
    if (component === 'list') {
      if (screenWidth > sizes.bootstrapGrid.smMax) {
        return true;
      }
      return isMobileListView;
    }

    if (component === 'map' && features.display_map) {
      if (screenWidth > sizes.bootstrapGrid.smMax) {
        return true;
      }
      return !isMobileListView;
    }

    return false;
  };

  if (!query.events || query.events.totalCount === 0) {
    const showPreviewPassedEvents =
      status === 'ongoing-and-future' &&
      query.previewPassedEvents &&
      query.previewPassedEvents.totalCount > 0;
    return (
      <>
        <p className={classNames({ 'p--centered': true, 'mb-40': true })}>
          <FormattedMessage id={showPreviewPassedEvents ? 'no-upcoming-events' : 'event.empty'} />
        </p>
        {showPreviewPassedEvents ? <EventPagePassedEventsPreview query={query} /> : null}
      </>
    );
  }

  return (
    <Row>
      {shouldRenderToggleListOrMap('list') ? (
        <Col id="event-list" md={features.display_map ? 8 : 12} xs={12}>
          {query.events.edges &&
            query.events.edges
              .filter(Boolean)
              .map(edge => edge.node)
              .filter(Boolean)
              .map((node, key) => (
                // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
                <div
                  key={key}
                  onMouseOver={() =>
                    screenWidth > sizes.bootstrapGrid.smMax ? onFocus(node.id) : null
                  }>
                  <EventPreview
                    // $FlowFixMe eslint
                    isHighlighted={eventSelected && eventSelected === node.id}
                    event={node}
                  />
                </div>
              ))}
          {relay.hasMore() && (
            <Row>
              <div className="text-center">
                <Button
                  disabled={loading}
                  onClick={() => {
                    setLoading(true);
                    relay.loadMore(EVENTS_PAGINATION, () => {
                      setLoading(false);
                    });
                  }}>
                  <FormattedMessage id={loading ? 'global.loading' : 'see-more-events'} />
                </Button>
              </div>
            </Row>
          )}
        </Col>
      ) : null}
      {shouldRenderToggleListOrMap('map') ? (
        <MapContainer md={4} xs={12} aria-hidden="true">
          <EventMap query={query} />
        </MapContainer>
      ) : null}
    </Row>
  );
};

const selector = formValueSelector('EventPageContainer');

const mapStateToProps = (state: GlobalState) => ({
  eventSelected: state.event.eventSelected,
  features: state.default.features,
  isMobileListView: state.event.isMobileListView,
  status: selector(state, 'status'),
});

const container = connect<Props, GlobalState, _>(mapStateToProps)(EventListPaginated);

export default createPaginationContainer(
  container,
  {
    query: graphql`
      fragment EventListPaginated_query on Query
        @argumentDefinitions(
          count: { type: "Int!" }
          cursor: { type: "String" }
          theme: { type: "ID" }
          project: { type: "ID" }
          search: { type: "String" }
          userType: { type: "ID" }
          isFuture: { type: "Boolean" }
          previewCount: { type: "Int", defaultValue: 5 }
          author: { type: "ID" }
          isRegistrable: { type: "Boolean" }
          orderBy: { type: "EventOrder" }
        ) {
        previewPassedEvents: events(first: $previewCount, isFuture: false, orderBy: $orderBy) {
          totalCount
        }
        ...EventPagePassedEventsPreview_query
          @arguments(previewCount: $previewCount, orderBy: $orderBy)
        ...EventMap_query
          @arguments(
            count: $count
            cursor: $cursor
            theme: $theme
            project: $project
            search: $search
            userType: $userType
            isFuture: $isFuture
            author: $author
            isRegistrable: $isRegistrable
            orderBy: $orderBy
          )
        events(
          first: $count
          after: $cursor
          theme: $theme
          project: $project
          search: $search
          userType: $userType
          isFuture: $isFuture
          author: $author
          isRegistrable: $isRegistrable
          orderBy: $orderBy
        ) @connection(key: "EventListPaginated_events", filters: []) {
          totalCount
          edges {
            node {
              id
              ...EventPreview_event
            }
          }
          pageInfo {
            hasPreviousPage
            hasNextPage
            startCursor
            endCursor
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    // $FlowFixMe Type of getConnection is not strict
    getConnectionFromProps(props: Props) {
      return props.query && props.query.events;
    },
    getFragmentVariables(prevVars: any) {
      return {
        ...prevVars,
      };
    },
    getVariables(props: Props, { count, cursor }: any, fragmentVariables: any) {
      return {
        ...fragmentVariables,
        count,
        cursor,
      };
    },
    query: graphql`
      query EventListPaginatedQuery(
        $cursor: String
        $count: Int
        $theme: ID
        $project: ID
        $search: String
        $userType: ID
        $isFuture: Boolean
        $author: ID
        $isRegistrable: Boolean
        $orderBy: EventOrder
      ) {
        ...EventListPaginated_query
          @arguments(
            cursor: $cursor
            count: $count
            theme: $theme
            project: $project
            search: $search
            userType: $userType
            isFuture: $isFuture
            author: $author
            isRegistrable: $isRegistrable
            orderBy: $orderBy
          )
      }
    `,
  },
);
