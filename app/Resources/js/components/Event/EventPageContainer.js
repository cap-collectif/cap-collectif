// @flow
import * as React from 'react';
import styled from 'styled-components';
import { FormattedHTMLMessage } from 'react-intl';
import { createFragmentContainer } from 'react-relay';
import { reduxForm } from 'redux-form';
import { graphql } from 'relay-runtime';
import type { EventPageContainer_query } from '~relay/EventPageContainer_query.graphql';

import ColorBox from '../Ui/Boxes/ColorBox';
import EventListFilters from './List/EventListFilters';
import EventRefetch from './List/EventRefetch';
import EventListCounter from './List/EventListCounter';
import EventListStatusFilter from './List/EventListStatusFilter';
import colors from '../../utils/colors';

type Props = {|
  +query: EventPageContainer_query,
  +eventPageBody: ?string,
  +backgroundColor: ?string,
|};

const EventFiltersContainer = styled(ColorBox).attrs({
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

export const formName = 'EventPageContainer';

export class EventPageContainer extends React.Component<Props> {
  render() {
    const { eventPageBody, query, backgroundColor } = this.props;

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
  }
}

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
        withEventOnly: { type: "Boolean" }
      ) {
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
          withEventOnly: $withEventOnly
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
