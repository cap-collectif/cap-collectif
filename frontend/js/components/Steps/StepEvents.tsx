import React, { useState } from 'react'
import { graphql, useFragment } from 'react-relay'
import { FormattedMessage, useIntl } from 'react-intl'
import StepEventsList from './StepEventsList'
import { Container } from './StepEvents.style'
import type { StepEvents_step$key } from '~relay/StepEvents_step.graphql'
import Flex from '~/components/Ui/Primitives/Layout/Flex'
import Heading from '~/components/Ui/Primitives/Heading'
import Button from '~/components/DesignSystem/Button/Button'
import Text from '~/components/Ui/Primitives/Text'
import Menu from '~ds/Menu/Menu'
import Icon, { ICON_NAME } from '~ui/Icons/Icon'
import Loader from '~ui/FeedbacksIndicators/Loader'
import { Box } from '@cap-collectif/ui'

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
        <Menu mr={4}>
          <Menu.Button>
            <Button>
              <Box mr={1}>{intl.formatMessage({ id: filter })}</Box>
              <Icon name={ICON_NAME.chevronDown} size="8" color="black" />
            </Button>
          </Menu.Button>

          <Menu.List>
            <Menu.ListItem
              onClick={() => {
                setFilter('theme.show.status.future')
              }}
            >
              <Text color="gray.900">{intl.formatMessage({ id: 'theme.show.status.future' })}</Text>
            </Menu.ListItem>
            <Menu.ListItem
              onClick={() => {
                setFilter('finished')
              }}
            >
              <Text color="gray.900">{intl.formatMessage({ id: 'finished' })}</Text>
            </Menu.ListItem>
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
