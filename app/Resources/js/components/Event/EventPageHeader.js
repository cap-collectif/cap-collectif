// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Jumbotron } from 'react-bootstrap';
import { createFragmentContainer, graphql } from 'react-relay';
import EventPageHeader_query from './__generated__/EventPageHeader_query.graphql';

type Props = {
  query: EventPageHeader_query,
};

export class EventPageHeader extends React.Component<Props> {
  render() {
    const { query } = this.props;
    return (
      <Jumbotron className="jumbotron--custom  jumbotron--bg-1 text-center">
        <div className="container">
          <h1>
            <FormattedMessage id="events-list" />
          </h1>
          <FormattedMessage id="number-of-events" values={{ num: query.events.totalCount }} />
        </div>
      </Jumbotron>
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
        isFuture: { type: "Boolean" }
      ) {
      events(
        first: $count
        after: $cursor
        theme: $theme
        project: $project
        search: $search
        isFuture: $isFuture
      ) {
        totalCount
      }
    }
  `,
});
