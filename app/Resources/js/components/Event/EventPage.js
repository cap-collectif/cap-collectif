// @flow
import * as React from 'react';
import { Row } from 'react-bootstrap';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import environment, { graphqlError } from '../../createRelayEnvironment';
import type {
  EventPageQueryResponse,
  EventPageQueryVariables,
} from './__generated__/EventPageQuery.graphql';
import config from '../../config';
import EventListFilters from './List/EventListFilters';
import EventRefetch from './List/EventRefetch';
import EventPageHeader from './EventPageHeader';

type Props = {};

export class EventPage extends React.Component<Props> {
  render() {
    return (
      <div className="event-page">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query EventPageQuery(
              $cursor: String
              $count: Int
              $search: String
              $theme: ID
              $project: ID
              $isFuture: Boolean
            ) {
              ...EventPageHeader_query
                @arguments(
                  cursor: $cursor
                  count: $count
                  search: $search
                  theme: $theme
                  project: $project
                  isFuture: $isFuture
                )
              ...EventRefetch_query
                @arguments(
                  cursor: $cursor
                  count: $count
                  search: $search
                  theme: $theme
                  project: $project
                  isFuture: $isFuture
                )
            }
          `}
          variables={
            ({
              count: config.isMobile ? 25 : 100,
              cursor: null,
              search: null,
              theme: null,
              project: null,
              isFuture: true,
            }: EventPageQueryVariables)
          }
          render={({ error, props }: { props: ?EventPageQueryResponse } & ReadyState) => {
            if (error) {
              return graphqlError;
            }
            if (props) {
              return (
                <div>
                  <section className="section--custom">
                    <EventPageHeader query={props} />
                  </section>
                  <section className="section--custom">
                    <div className="container">
                      <div
                        id="event-page-filters"
                        className={config.isMobile ? 'event-filters' : null}>
                        <EventListFilters addToggleViewButton />
                      </div>
                      <div id="event-page-rendered">
                        {/* $FlowFixMe */}
                        <EventRefetch query={props} />
                      </div>
                    </div>
                  </section>
                </div>
              );
            }
            return (
              <Row>
                <Loader />
              </Row>
            );
          }}
        />
      </div>
    );
  }
}

export default EventPage;
