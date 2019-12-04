// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { change } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Button, Row, Col } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import { formName } from '../EventPageContainer';
import EventPreview from '../EventPreview';
import type { Dispatch } from '../../../types';
import type { EventPagePassedEventsPreview_query } from '~relay/EventPagePassedEventsPreview_query.graphql';

type Props = {|
  query: EventPagePassedEventsPreview_query,
  dispatch: Dispatch,
|};

export const EventPagePassedEventsPreview = (props: Props) => {
  const { query, dispatch } = props;

  if (!query.previewPassedEvents || query.previewPassedEvents.totalCount === 0) {
    return null;
  }

  return (
    <>
      <h5>
        <strong>
          <FormattedMessage
            id="past-events"
            values={{ num: query.previewPassedEvents.totalCount }}
          />
        </strong>
      </h5>
      <Row>
        <Col id="EventPagePassedEventsPreview" md={12} xs={12}>
          {query.previewPassedEvents.edges &&
            query.previewPassedEvents.edges
              .filter(Boolean)
              .map(edge => edge.node)
              .filter(Boolean)
              .map((node, key) => <EventPreview key={key} isHighlighted={false} event={node} />)}
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
    </>
  );
};

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
