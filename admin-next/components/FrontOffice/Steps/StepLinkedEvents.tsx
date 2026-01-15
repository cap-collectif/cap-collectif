import React, { FC, useState } from 'react'
import { graphql, useFragment } from 'react-relay'
import { FormattedMessage, useIntl } from 'react-intl'
import { Box, Button, CapUIIcon, Flex, Menu, Spinner, Text } from '@cap-collectif/ui'
import { StepLinkedEvents_step$key } from '@relay/StepLinkedEvents_step.graphql'

type Props = {
  step: StepLinkedEvents_step$key
}

const FRAGMENT = graphql`
  fragment StepLinkedEvents_step on Step {
    eventsWithoutFilters: events(orderBy: { field: START_AT, direction: DESC }, isFuture: null) {
      totalCount
    }
    eventsFuture: events(orderBy: { field: START_AT, direction: DESC }, isFuture: true) {
      totalCount
    }
    eventsPast: events(orderBy: { field: START_AT, direction: DESC }, isFuture: false) {
      totalCount
    }
  }
`

export const StepLinkedEvents: FC<Props> = ({ step: stepKey }) => {
  const intl = useIntl()
  const step = useFragment(FRAGMENT, stepKey)

  if (undefined === step.eventsFuture || step.eventsPast || step.eventsWithoutFilters) return null

  const statusFilter = step.eventsFuture.totalCount > 0 ? 'theme.show.status.future' : 'finished'
  const [filter, setFilter] = useState(statusFilter)
  const totalCount =
    filter === 'theme.show.status.future'
      ? step.eventsFuture.totalCount
      : filter === 'finished'
      ? step.eventsPast.totalCount
      : step.eventsWithoutFilters.totalCount

  if (!step.eventsWithoutFilters.totalCount) return null

  return (
    <Box className="step_linked_events">
      <Flex direction="row" justify="space-between" alignItems="center">
        <Box mb={4}>
          <FormattedMessage id="global.events" /> <span className="small excerpt">{totalCount}</span>
        </Box>
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
      <React.Suspense fallback={<Spinner />}>---- Les events ----</React.Suspense>
    </Box>
  )
}

export default StepLinkedEvents
