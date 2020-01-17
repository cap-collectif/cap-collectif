// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { change } from 'redux-form';
import styled, { type StyledComponent } from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Button, Row, Col } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import { formName } from '../EventPageContainer';
import EventPreview from '../EventPreview/EventPreview';
import type { Dispatch } from '~/types';
import type { EventPagePassedEventsPreview_query } from '~relay/EventPagePassedEventsPreview_query.graphql';
import config from '~/config';

type Props = {|
  query: EventPagePassedEventsPreview_query,
  dispatch: Dispatch,
|};

const EventPagePassedEventsPreviewContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  & > h4 {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
  }

  .eventPreview {
    margin-bottom: 15px;
  }
`;

export const EventPagePassedEventsPreview = ({ query, dispatch }: Props) =>
  !query.previewPassedEvents || query.previewPassedEvents.totalCount === 0 ? null : (
    <EventPagePassedEventsPreviewContainer>
      <h4>
        <FormattedMessage id="past-events" values={{ num: query.previewPassedEvents.totalCount }} />
      </h4>
      <Row>
        <Col id="EventPagePassedEventsPreview" md={12} xs={12}>
          {query.previewPassedEvents.edges &&
            query.previewPassedEvents.edges
              .filter(Boolean)
              .map(edge => edge.node)
              .filter(Boolean)
              .map((node, key) => (
                <EventPreview
                  key={key}
                  event={node}
                  className="eventPreview_list"
                  isHorizontal={!config.isMobile}
                  isDateInline
                />
              ))}
        </Col>
      </Row>
      <Row>
        <div className="text-center">
          <Button
            onClick={() => {
              dispatch(change(formName, 'status', 'finished'));
            }}>
            <FormattedMessage id="see-all-past-events" />
          </Button>
        </div>
      </Row>
    </EventPagePassedEventsPreviewContainer>
  );

const container = connect()(EventPagePassedEventsPreview);

export default createFragmentContainer(container, {
  query: graphql`
    fragment EventPagePassedEventsPreview_query on Query
      @argumentDefinitions(previewCount: { type: "Int" }, orderBy: { type: "EventOrder" }) {
      previewPassedEvents: events(first: $previewCount, isFuture: false, orderBy: $orderBy) {
        totalCount
        edges {
          node {
            ...EventPreview_event
          }
        }
      }
    }
  `,
});
