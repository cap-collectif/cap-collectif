// @flow
import React, { useEffect } from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { createFragmentContainer } from 'react-relay';
import { reduxForm } from 'redux-form';
import { graphql } from 'relay-runtime';
import { Panel } from 'react-bootstrap';
import type { EventPageContainer_query } from '~relay/EventPageContainer_query.graphql';

import ColorBox from '../Ui/Boxes/ColorBox';
import EventListFilters from './List/EventListFilters';
import EventRefetch from './List/EventRefetch';
import EventListCounter from './List/EventListCounter';
import EventListStatusFilter from './List/EventListStatusFilter';
import colors from '~/utils/colors';
import { UPDATE_ALERT } from '~/constants/AlertConstants';
import AppDispatcher from '~/dispatchers/AppDispatcher';
import EventPreview from './EventPreview/EventPreview';
import config from '~/config';

type Props = {|
  +query: EventPageContainer_query,
  +eventPageBody: ?string,
  +backgroundColor: ?string,
|};

const EventFiltersContainer: StyledComponent<{}, {}, typeof ColorBox> = styled(ColorBox).attrs({
  id: 'event-page-filters',
})`
  margin: 25px 0 30px;
  position: sticky;
  top: 50px;
  z-index: 1010;

  .event-search-group .form-group {
    margin-bottom: 0;
  }
`;

const AwaitingEventsPanel: StyledComponent<{}, {}, typeof Panel> = styled(Panel)`
  margin-top: 15px;
  margin-bottom: 0 !important;

  div:last-child {
    border-radius: 0 !important;
  }
`;

export const formName = 'EventPageContainer';

const renderAwaitingOrRefusedEvents = (query: EventPageContainer_query) =>
  query.viewer &&
  query.viewer.awaitingOrRefusedEvents &&
  query.viewer.awaitingOrRefusedEvents.edges &&
  query.viewer.awaitingOrRefusedEvents.edges
    .filter(Boolean)
    .map(edge => edge.node)
    .filter(Boolean)
    .map((node, key) => (
      <div key={key}>
        {key === 0 ? (
          <AwaitingEventsPanel bsStyle="danger" className="mt-15">
            <Panel.Heading>
              <Panel.Title componentClass="h3">
                <FormattedMessage
                  id="events-waiting-admin-examination"
                  values={{
                    num: query.viewer?.awaitingOrRefusedEvents?.totalCount,
                  }}
                />
              </Panel.Title>
            </Panel.Heading>
            <EventPreview
              event={node}
              displayReview
              isHorizontal={!config.isMobile}
              isDateInline
              className="eventPreview_list"
            />
          </AwaitingEventsPanel>
        ) : (
          <EventPreview
            event={node}
            displayReview
            isHorizontal={!config.isMobile}
            isDateInline
            className="eventPreview_list mt-15"
          />
        )}
      </div>
    ));

export const EventPageContainer = ({ eventPageBody, query, backgroundColor }: Props) => {
  useEffect(() => {
    if (window.location.href.indexOf('?delete=success') !== -1) {
      AppDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          bsStyle: 'success',
          content: 'event-deleted',
        },
      });
      window.history.pushState('', '', '/events');
    }
  }, []);

  return (
    <div className="container">
      {eventPageBody && (
        <div>
          <FormattedHTMLMessage id={eventPageBody} />
          <div className="visible-xs-block visible-sm-block mt-15">
            <div className="d-flex align-items-center">
              <EventListCounter query={query} />
              <EventListStatusFilter screen="mobile" />
            </div>
          </div>
        </div>
      )}
      {renderAwaitingOrRefusedEvents(query)}
      <EventFiltersContainer
        darkness={0.1}
        backgroundColor={backgroundColor || colors.primaryColor}>
        <EventListFilters query={query} addToggleViewButton />
      </EventFiltersContainer>
      <div id="event-page-rendered">
        <EventRefetch query={query} />
      </div>
    </div>
  );
};

export const getInitialValues = () => {
  const urlSearch = new URLSearchParams(window.location.search);
  const project = urlSearch.get('projectId') || null;
  const hasFilteredUrl = !!project;
  return {
    status: hasFilteredUrl ? 'all' : 'ongoing-and-future',
    project,
  };
};

const form = reduxForm({
  form: formName,
  destroyOnUnmount: false,
  initialValues: getInitialValues(),
})(EventPageContainer);

export default createFragmentContainer(form, {
  query: graphql`
    fragment EventPageContainer_query on Query
      @argumentDefinitions(
        count: { type: "Int!" }
        cursor: { type: "String" }
        theme: { type: "ID" }
        project: { type: "ID" }
        search: { type: "String" }
        userType: { type: "ID" }
        isFuture: { type: "Boolean" }
        author: { type: "ID" }
        isRegistrable: { type: "Boolean" }
        orderBy: { type: "EventOrder" }
        isAuthenticated: { type: "Boolean!" }
      ) {
      viewer @include(if: $isAuthenticated) {
        awaitingOrRefusedEvents {
          totalCount
          edges {
            node {
              id
              ...EventPreview_event
            }
          }
        }
      }
      ...EventRefetch_query
        @arguments(
          cursor: $cursor
          count: $count
          search: $search
          theme: $theme
          project: $project
          userType: $userType
          isFuture: $isFuture
          author: $author
          isRegistrable: $isRegistrable
          orderBy: $orderBy
        )
      ...EventListFilters_query
        @arguments(
          cursor: $cursor
          count: $count
          search: $search
          theme: $theme
          project: $project
          userType: $userType
          isFuture: $isFuture
          author: $author
          isRegistrable: $isRegistrable
          orderBy: $orderBy
        )
      ...EventListCounter_query
        @arguments(
          cursor: $cursor
          count: $count
          search: $search
          theme: $theme
          project: $project
          userType: $userType
          isFuture: $isFuture
          author: $author
          isRegistrable: $isRegistrable
          orderBy: $orderBy
        )
    }
  `,
});
