import React, { useState } from 'react'
import { graphql, useFragment } from 'react-relay'
import { FormattedMessage, useIntl } from 'react-intl'
import StepEventsList from './StepEventsList'
import { Container } from './StepEvents.style'
import type { StepEvents_step$key } from '~relay/StepEvents_step.graphql'
import Loader from '~ui/FeedbacksIndicators/Loader'
import { Button, CapUIIcon, Flex, Heading, Menu, Text } from '@cap-collectif/ui'

type Props = {
  readonly step: StepEvents_step$key
}

const FRAGMENT = graphql`
  fragment StepEvents_step on Step {
    id
    ...StepEventsList_step @arguments(count: 40, orderBy: { field: START_AT, direction: DESC })
    eventsWithoutFilters: events(orderBy: { field: START_AT, direction: DESC }, isFuture: null) {
      totalCount
    }
    eventsFuture: events(orderBy: { field: START_AT, direction: DESC }, isFuture: true) {
      totalCount
    }
    eventsPast: events(isFuture: false) {
      totalCount
    }
  }
`

export const StepEvents = ({ step: stepKey }: Props) => {
  const intl = useIntl()
  const step = useFragment(FRAGMENT, stepKey)
  const statusFilter = step.eventsFuture.totalCount > 0 ? 'theme.show.status.future' : 'finished'
  const [filter, setFilter] = useState(statusFilter)
  const totalCount =
    filter === 'theme.show.status.future'
      ? step.eventsFuture.totalCount
      : filter === 'finished'
      ? step.eventsPast.totalCount
      : step.eventsWithoutFilters.totalCount

  return (
    <Container id="StepEvents" className="block">
      <Flex direction="row" justify="space-between" alignItems={'center'}>
        <Heading as="h2" mb={4}>
          <FormattedMessage id="global.events" /> <span className="small excerpt">{totalCount}</span>
        </Heading>
        <Menu
          disclosure={
            <Button variant="tertiary" rightIcon={CapUIIcon.ArrowDown}>
              {intl.formatMessage({ id: filter })}
            </Button>
          }
        >
          <Menu.List>
            <Menu.Item
              border="none"
              onClick={() => {
                setFilter('theme.show.status.future')
              }}
            >
              <Text color="gray.900">{intl.formatMessage({ id: 'theme.show.status.future' })}</Text>
            </Menu.Item>
            <Menu.Item
              border="none"
              onClick={() => {
                setFilter('finished')
              }}
            >
              <Text color="gray.900">{intl.formatMessage({ id: 'finished' })}</Text>
            </Menu.Item>
          </Menu.List>
        </Menu>
      </Flex>
      <React.Suspense fallback={<Loader />}>
        <StepEventsList filter={filter} step={step} />
      </React.Suspense>
    </Container>
  )
}

export default StepEvents
