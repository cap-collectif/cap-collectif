import React, { useEffect } from 'react'

import styled from 'styled-components'
import { FormattedHTMLMessage, FormattedMessage, useIntl } from 'react-intl'
import { createFragmentContainer } from 'react-relay'
import { reduxForm } from 'redux-form'
import { graphql } from 'relay-runtime'
import { Button, Panel } from 'react-bootstrap'
import type { EventListPageContainer_query } from '~relay/EventListPageContainer_query.graphql'
import ColorBox from '../Ui/Boxes/ColorBox'
import EventListFilters from './List/EventListFilters'
import EventRefetch from './List/EventRefetch'
import EventListCounter from './List/EventListCounter'
import EventListStatusFilter from './List/EventListStatusFilter'
import colors from '~/utils/colors'
import EventPreview from './EventPreview/EventPreview'
import { getOrderBy, ORDER_TYPE } from './Profile/EventListProfileRefetch'
import { useSelector } from 'react-redux'
import { GlobalState } from '~/types'
import { CapUIFontSize, Heading, toast } from '@cap-collectif/ui'

type Props = {
  readonly query: EventListPageContainer_query
  readonly eventPageBody: string | null | undefined
  readonly backgroundColor: string | null | undefined
}
const EventFiltersContainer = styled(ColorBox)`
  margin: 25px 0 30px;
  position: sticky;
  z-index: 50;
  .event-search-group .form-group {
    margin-bottom: 0;
  }
`
const AwaitingEventsPanel = styled(Panel)`
  margin-top: 15px;
  margin-bottom: 0 !important;
  & > div:last-child {
    border-radius: 0 !important;
  }
`
export const formName = 'EventPageContainer'

const renderAwaitingOrRefusedEvents = (query: EventListPageContainer_query) => {
  if (query.viewer && query.viewer.adminAwaitingEvents && query.viewer.adminAwaitingEvents > 0) {
    return (
      <AwaitingEventsPanel bsStyle="danger" className="mt-15">
        <Panel.Heading className="justify-content-between d-flex align-items-center">
          <Panel.Title componentClass="h3">
            <FormattedMessage
              id="event-waiting-admin-examination-admin"
              values={{
                num: query.viewer.adminAwaitingEvents,
              }}
            />
          </Panel.Title>
          <Button
            id="examine-events"
            bsStyle="primary"
            className="mt-5"
            onClick={() => {
              window.location.href = `${window.location.protocol}//${window.location.host}/admin-next/events`
            }}
          >
            <FormattedMessage id="examine-events" />
          </Button>
        </Panel.Heading>
      </AwaitingEventsPanel>
    )
  }

  if (query.viewer && query.viewer.awaitingOrRefusedEvents && query.viewer.awaitingOrRefusedEvents.edges) {
    return query.viewer.awaitingOrRefusedEvents.edges
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
              <EventPreview event={node} displayReview />
            </AwaitingEventsPanel>
          ) : (
            <EventPreview event={node} displayReview />
          )}
        </div>
      ))
  }
}

const listContainerId = 'event-page-filters'

export const EventListPageContainer = ({ eventPageBody, query, backgroundColor }: Props) => {
  const intl = useIntl()
  const status = useSelector((state: GlobalState) => state.form[formName].values.status)
  useEffect(() => {
    if (window.location.href.indexOf('?delete=success') !== -1) {
      toast({ content: intl.formatMessage({ id: 'event-deleted' }), variant: 'success' })

      window.history.pushState('', '', '/events')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="container">
      {eventPageBody && (
        <div>
          <FormattedHTMLMessage id={eventPageBody} />
        </div>
      )}
      {renderAwaitingOrRefusedEvents(query)}
      <div>
        <div className="visible-xs-block visible-sm-block mt-15">
          <div className="d-flex align-items-center">
            <EventListCounter query={query} status={status} />
            <EventListStatusFilter screen="mobile" />
          </div>
        </div>
      </div>
      <EventFiltersContainer
        darkness={10}
        backgroundColor={backgroundColor || colors.primaryColor}
        id={listContainerId}
      >
        <EventListFilters query={query} addToggleViewButton formName={formName} />
      </EventFiltersContainer>
      <div id="event-page-rendered">
        {status === 'all' ? (
          <Heading as="h3" mb={2} fontWeight={600} fontSize={CapUIFontSize.Headline}>
            {intl.formatMessage({ id: 'theme.show.status.future' })}
          </Heading>
        ) : null}
        <EventRefetch
          query={query}
          formName={formName}
          orderBy={getOrderBy(ORDER_TYPE.OLD)}
          isFuture
          hide={status === 'finished'}
        />
        {status === 'all' ? (
          <Heading as="h3" mb={2} fontWeight={600} fontSize={CapUIFontSize.Headline}>
            {intl.formatMessage({ id: 'finished' })}
          </Heading>
        ) : null}
        <EventRefetch
          query={query}
          formName={formName}
          orderBy={getOrderBy(ORDER_TYPE.LAST)}
          isFuture={false}
          hide={status === 'ongoing-and-future'}
          count={3}
          hideMap={status === 'all'}
        />
      </div>
    </div>
  )
}
export const getInitialValues = () => {
  const urlSearch = new URLSearchParams(window.location.search)
  const project = urlSearch.get('projectId') || null
  const theme = urlSearch.get('theme') ?? null
  const district = urlSearch.get('district') ?? null
  return {
    status: 'all',
    project,
    theme,
    district,
  }
}
const form = reduxForm({
  form: formName,
  destroyOnUnmount: false,
  initialValues: getInitialValues(),
})(EventListPageContainer)
export default createFragmentContainer(form, {
  query: graphql`
    fragment EventListPageContainer_query on Query
    @argumentDefinitions(
      count: { type: "Int!" }
      cursor: { type: "String" }
      locale: { type: "TranslationLocale" }
      theme: { type: "ID" }
      district: { type: "ID" }
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
              ...EventPreview_event @arguments(isAuthenticated: $isAuthenticated)
            }
          }
        }
        adminAwaitingEvents
      }
      ...EventRefetch_query
        @arguments(
          cursor: $cursor
          count: $count
          search: $search
          locale: $locale
          theme: $theme
          district: $district
          project: $project
          userType: $userType
          isFuture: $isFuture
          author: $author
          isRegistrable: $isRegistrable
          orderBy: $orderBy
          isAuthenticated: $isAuthenticated
        )
      ...EventListFilters_query
      ...EventListCounter_query
    }
  `,
})
