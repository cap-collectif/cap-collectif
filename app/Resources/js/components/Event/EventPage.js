// @flow
import * as React from 'react';
import { Row } from 'react-bootstrap';
import { QueryRenderer, graphql } from 'react-relay';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import environment, { graphqlError } from '../../createRelayEnvironment';
import type {
  EventPageQueryResponse,
  EventPageQueryVariables,
} from '~relay/EventPageQuery.graphql';
import config from '../../config';
import EventPageContainer, { getInitialValues } from './EventPageContainer';
import EventPageHeader from './EventPageHeader';
import withColors from '../Utils/withColors';

type Props = {|
  +eventPageTitle: ?string,
  +eventPageBody: ?string,
  +backgroundColor: ?string,
|};

export class EventPage extends React.Component<Props> {
  render() {
    const { backgroundColor } = this.props;

    const initialValues = getInitialValues();
    const { project } = initialValues;
    const isFuture =
      initialValues.status === 'all' ? null : initialValues.status === 'ongoing-and-future';

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
              $userType: ID
              $isFuture: Boolean
              $author: ID
              $isRegistrable: Boolean
              $orderBy: EventOrder!
            ) {
              ...EventPageContainer_query
                @arguments(
                  cursor: $cursor
                  count: $count
                  search: $search
                  theme: $theme
                  project: $project
                  userType: $userType
                  author: $author
                  isRegistrable: $isRegistrable
                  isFuture: $isFuture
                  orderBy: $orderBy
                )
            }
          `}
          variables={
            ({
              count: config.isMobile ? 25 : 100,
              cursor: null,
              search: null,
              theme: null,
              userType: null,
              project,
              isFuture,
              author: null,
              isRegistrable: null,
              orderBy: { field: 'START_AT', direction: 'ASC' },
            }: EventPageQueryVariables)
          }
          render={({
            error,
            props,
          }: {
            props: ?EventPageQueryResponse,
            ...ReactRelayReadyState,
          }) => {
            if (error) {
              return graphqlError;
            }
            if (props) {
              return (
                <div>
                  <section className="jumbotron--bg-1 ">
                    <EventPageHeader eventPageTitle={this.props.eventPageTitle} />
                  </section>
                  <section className="section--alt">
                    <EventPageContainer
                      query={props}
                      eventPageBody={this.props.eventPageBody}
                      backgroundColor={backgroundColor}
                    />
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

export default withColors(EventPage);
