import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import moment from 'moment'
import type { EventCard_event$key } from '@relay/EventCard_event.graphql'
import { Box, BoxProps, CapUIFontSize, Card, CardContent, CardCover, Flex } from '@cap-collectif/ui'

const FRAGMENT = graphql`
  fragment EventCard_event on Event {
    id
    title
    url
    timeRange {
      startAt
    }
    themes {
      id
      title
    }
  }
`

export const EventCard: React.FC<BoxProps & { event: EventCard_event$key }> = ({
  event: eventQuery,
  backgroundColor,
  ...props
}) => {
  const event = useFragment(FRAGMENT, eventQuery)
  return (
    <Card {...props} format="horizontal">
      <CardCover overflow="hidden">
        <Box width="100%" color="neutral-gray.darker" fontSize={CapUIFontSize.BodySmall} fontWeight={700}>
          <Flex justify="center" bg="red.600" py="xs" color="white" uppercase>
            {moment(event.timeRange?.startAt).format('MMM')}
          </Flex>
          <Flex justify="center" alignItems="center" py="xxs" fontSize={CapUIFontSize.BodyLarge} fontWeight={600}>
            {moment(event.timeRange?.startAt).format('DD')}
          </Flex>
        </Box>
      </CardCover>
      <CardContent primaryInfo={event.title} href={event.url} />
    </Card>
  )
}

export default EventCard
