// @flow
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Row, Col } from 'react-bootstrap';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import classNames from 'classnames';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { useWindowWidth } from '../../../utils/hooks/useWindowWidth';
import EventPreview from '../EventPreview';
import EventMap from '../Map/EventMap';
import type { EventListPaginated_query } from './__generated__/EventListPaginatedQuery.graphql';
import type { GlobalState, Dispatch, FeatureToggles } from '../../../types';
import { changeEventSelected } from '../../../redux/modules/event';
import sizes from '../../../utils/sizes';

type Props = {
  query: EventListPaginated_query,
  relay: RelayPaginationProp,
  eventSelected: ?string,
  dispatch: Dispatch,
  features: FeatureToggles,
  isMobileListView: boolean,
};

const EVENTS_PAGINATION = 100;

const MapContainer = styled(Col)`
  top: 150px;
  position: sticky;

  @media screen and (max-width: 991px) {
    top: 0;
  }
`;

export const EventListPaginated = (props: Props) => {
  const { query, relay, eventSelected, features, dispatch, isMobileListView } = props;
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

  if (!query || !query.events || query.events.totalCount === 0) {
    return (
      <p className={classNames({ 'p--centered': true, 'mb-40': true })}>
        <FormattedMessage id="event.empty" />
      </p>
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
                  <FormattedMessage id={loading ? 'global.loading' : 'global.more'} />
                </Button>
              </div>
            </Row>
          )}
        </Col>
      ) : null}
      {shouldRenderToggleListOrMap('map') ? (
        <MapContainer md={4} xs={12} aria-hidden="true">
          {/* $FlowFixMe relayProps */}
          <EventMap query={query} />
        </MapContainer>
      ) : null}
    </Row>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  eventSelected: state.event.eventSelected,
  features: state.default.features,
  isMobileListView: state.event.isMobileListView,
});

const container = connect(mapStateToProps)(EventListPaginated);

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
        ) {
        ...EventMap_query
          @arguments(
            count: $count
            cursor: $cursor
            theme: $theme
            project: $project
            search: $search
            userType: $userType
            isFuture: $isFuture
          )
        events(
          first: $count
          after: $cursor
          theme: $theme
          project: $project
          search: $search
          userType: $userType
          isFuture: $isFuture
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
    getConnectionFromProps(props: Props) {
      return props.query && props.query.events;
    },
    getFragmentVariables(prevVars) {
      return {
        ...prevVars,
      };
    },
    getVariables(props: Props, { count, cursor }, fragmentVariables) {
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
          )
      }
    `,
  },
);
