import * as React from 'react'
import { connect } from 'react-redux'
import { change } from 'redux-form'

import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'
import { Button, Row, Col } from 'react-bootstrap'
import { graphql, createFragmentContainer } from 'react-relay'
import EventPreview from '../EventPreview/EventPreview'
import type { Dispatch } from '~/types'
import type { EventPagePassedEventsPreview_query } from '~relay/EventPagePassedEventsPreview_query.graphql'

type Props = {
  query: EventPagePassedEventsPreview_query
  dispatch: Dispatch
  formName: string
}
const EventPagePassedEventsPreviewContainer = styled.div`
  & > h4 {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
  }

  .eventPreview {
    margin-bottom: 15px;
  }
`
export const EventPagePassedEventsPreview = ({ query, dispatch, formName }: Props) =>
  !query.previewPassedEvents || query.previewPassedEvents.totalCount === 0 ? null : (
    <EventPagePassedEventsPreviewContainer>
      <h4>
        <FormattedMessage
          id="past-events"
          values={{
            num: query.previewPassedEvents.totalCount,
          }}
        />
      </h4>
      <Row>
        <Col id="EventPagePassedEventsPreview" md={12} xs={12}>
          {query.previewPassedEvents.edges &&
            query.previewPassedEvents.edges
              .filter(Boolean)
              .map(edge => edge.node)
              .filter(Boolean)
              .map((node, key) => <EventPreview key={key} event={node} />)}
        </Col>
      </Row>
      <Row>
        <div className="text-center">
          <Button
            onClick={() => {
              dispatch(change(formName, 'status', 'finished'))
            }}
          >
            <FormattedMessage id="see-all-past-events" />
          </Button>
        </div>
      </Row>
    </EventPagePassedEventsPreviewContainer>
  )
// @ts-ignore
const container = connect()(EventPagePassedEventsPreview)
export default createFragmentContainer(container, {
  query: graphql`
    fragment EventPagePassedEventsPreview_query on Query
    @argumentDefinitions(
      locale: { type: "TranslationLocale" }
      previewCount: { type: "Int" }
      orderBy: { type: "EventOrder" }
      isAuthenticated: { type: "Boolean!" }
    ) {
      previewPassedEvents: events(locale: $locale, first: $previewCount, isFuture: false, orderBy: $orderBy) {
        totalCount
        edges {
          node {
            ...EventPreview_event @arguments(isAuthenticated: $isAuthenticated)
          }
        }
      }
    }
  `,
})
