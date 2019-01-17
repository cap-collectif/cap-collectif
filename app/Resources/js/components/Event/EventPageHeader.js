// @flow
import * as React from 'react';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import type { EventPageHeader_query } from './__generated__/EventPageHeader_query.graphql';

type Props = {
  query: EventPageHeader_query,
  eventPageTitle: ?string,
};

export class EventPageHeader extends React.Component<Props> {
  render() {
    const { query, eventPageTitle } = this.props;
    return (
      <div className="container text-center">
        <h1>
          {<FormattedHTMLMessage id={eventPageTitle} /> || <FormattedMessage id="events-list" />}
        </h1>
        <FormattedMessage id="number-of-events" values={{ num: query.events.totalCount }} />
      </div>
    );
  }
}

export default createFragmentContainer(EventPageHeader, {
  query: graphql`
    fragment EventPageHeader_query on Query
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
      ) {
        totalCount
      }
    }
  `,
});
