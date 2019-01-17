// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Row, Col } from 'react-bootstrap';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import classNames from 'classnames';
import { connect } from 'react-redux';
import EventPreview from '../EventPreview';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import EventMap from '../Map/EventMap';
import EventListPaginated_query from './__generated__/EventListPaginatedQuery.graphql';
import type { GlobalState, Dispatch, FeatureToggles } from '../../../types';
import { changeEventSelected } from '../../../redux/modules/event';
import config from '../../../config';

type Props = {
  query: EventListPaginated_query,
  relay: RelayPaginationProp,
  eventSelected: ?string,
  dispatch: Dispatch,
  features: FeatureToggles,
  isMobileListView: boolean,
};

type State = {
  loading: boolean,
};

const EVENTS_PAGINATION = 25;

export class EventListPaginated extends React.Component<Props, State> {
  state = {
    loading: false,
  };

  onFocus(eventId: string) {
    const { dispatch, features } = this.props;
    if (features.display_map) {
      dispatch(changeEventSelected(eventId));
    }
  }

  shouldRenderToggleListOrMap(component: 'list' | 'map'): boolean {
    const { isMobileListView, features } = this.props;
    if (component === 'list') {
      if (!config.isMobile) {
        return true;
      }

      return isMobileListView;
    }
    if (component === 'map' && features.display_map) {
      if (!config.isMobile) {
        return true;
      }

      return !isMobileListView;
    }

    return false;
  }

  render() {
    const { query, relay, eventSelected, features } = this.props;

    if (query.events.totalCount === 0) {
      return (
        <p className={classNames({ 'p--centered': true, 'mb-40': true })}>
          <FormattedMessage id="event.empty" />
        </p>
      );
    }

    return (
      <React.Fragment>
        <Row>
          {this.shouldRenderToggleListOrMap('list') ? (
            <Col
              id="event-list"
              md={features.display_map ? 8 : 12}
              sm={features.display_map ? 8 : 12}
              xs={12}>
              {query.events.edges &&
                query.events.edges
                  .filter(Boolean)
                  .map(edge => edge.node)
                  .filter(Boolean)
                  .map((node, key) => (
                    // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
                    <Row
                      key={key}
                      onMouseOver={() => (config.isMobile ? null : this.onFocus(node.id))}
                      className={config.isMobile ? 'ml-0 mr-0' : null}>
                      <EventPreview
                        // $FlowFixMe eslint
                        isHighlighted={eventSelected && eventSelected === node.id}
                        event={node}
                      />
                    </Row>
                  ))}
            </Col>
          ) : null}
          {this.shouldRenderToggleListOrMap('map') ? (
            <Col
              md={!config.isMobile ? 4 : 12}
              sm={!config.isMobile ? 4 : 12}
              xs={12}
              className={!config.isMobile ? 'sticky-t-60' : null}>
              <EventMap events={query.events} />
            </Col>
          ) : null}
        </Row>
        {relay.hasMore() && (
          <Row>
            <div className="text-center">
              {this.state.loading ? (
                <Loader />
              ) : (
                <Button
                  bsStyle="link"
                  onClick={() => {
                    this.setState({ loading: true });
                    relay.loadMore(EVENTS_PAGINATION, () => {
                      this.setState({ loading: false });
                    });
                  }}>
                  <FormattedMessage id="global.more" />
                </Button>
              )}
            </div>
          </Row>
        )}
      </React.Fragment>
    );
  }
}

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
          status: { type: "String" }
          isFuture: { type: "Boolean" }
        ) {
        events(
          first: $count
          after: $cursor
          theme: $theme
          project: $project
          search: $search
          userType: $status
          isFuture: $isFuture
        ) @connection(key: "EventListPaginated_events", filters: []) {
          totalCount
          ...EventMap_events
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
        $status: String
        $isFuture: Boolean
      ) {
        ...EventListPaginated_query
          @arguments(
            cursor: $cursor
            count: $count
            theme: $theme
            project: $project
            search: $search
            userType: $status
            isFuture: $isFuture
          )
      }
    `,
  },
);
