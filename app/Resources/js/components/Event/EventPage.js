// @flow
import * as React from 'react';
import styled from 'styled-components';
import { Row } from 'react-bootstrap';
import { darken } from 'polished';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import { FormattedHTMLMessage } from 'react-intl';
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
import colors from '../../utils/colors';
import withColors from '../Utils/withColors';

type Props = {
  eventPageTitle: ?string,
  eventPageBody: ?string,
  backgroundColor: ?string,
};

const EventFiltersWrapper = styled.div.attrs({
  id: 'event-page-filters',
})`
  padding: 15px;
  background-color: ${props =>
    props.backgroundColor ? darken(0.1, props.backgroundColor) : colors.primaryColor};
  color: ${colors.white};
  margin: 25px 0 30px;
  border-radius: 4px;

  .form-group {
    margin-bottom: 0;
  }

  @media screen and (max-width: $screen-sm-max) {
    position: sticky;
    top: 50px;
    z-index: 1010;
    min-height: 60px;
    padding: 10px 0;
  }
`;

export class EventPage extends React.Component<Props> {
  render() {
    const { backgroundColor } = this.props;

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
                  <section className="jumbotron--bg-1 ">
                    {/* $FlowFixMe */}
                    <EventPageHeader eventPageTitle={this.props.eventPageTitle} />
                  </section>
                  <section className="section--alt">
                    <div className="container">
                      {this.props.eventPageBody && (
                        <p>
                          <FormattedHTMLMessage id={this.props.eventPageBody} />
                        </p>
                      )}
                      <EventFiltersWrapper backgroundColor={backgroundColor}>
                        <EventListFilters query={props} addToggleViewButton />
                      </EventFiltersWrapper>
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

export default withColors(EventPage);
