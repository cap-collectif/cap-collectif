import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import moment from 'moment'
import type { EventCard_event$key } from '@relay/EventCard_event.graphql'
import { Box, BoxProps, CapUIIcon, Card, Flex, Heading, Text } from '@cap-collectif/ui'
import { formatInfo } from '@shared/projectCard/ProjectCard.utils'
import { pxToRem } from '@shared/utils/pxToRem'

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
    <Box
      as="a"
      href={event.url}
      display="grid"
      width="100%"
      css={{
        '&:hover': {
          textDecoration: 'none',
        },
      }}
    >
      <Card
        bg="white"
        p={3}
        flexDirection="row"
        overflow="hidden"
        display="flex"
        border="normal"
        position="relative"
        alignItems="start"
        {...props}
      >
        <Card
          flexDirection="row"
          bg="neutral-gray.100"
          p={0}
          width={pxToRem(64)}
          mr={4}
          border="unset"
          overflow="hidden"
          borderRadius="accordion"
          flexShrink={0}
        >
          <Flex justify="center" bg="red.600" py={1}>
            <Text fontSize={2} as="div" color="white" fontWeight={700} uppercase>
              {moment(event.timeRange?.startAt).format('MMM')}
            </Text>
          </Flex>
          <Flex justify="center" alignItems="center" py={2}>
            <Text fontSize={5} as="div" color="gray.900" fontWeight={600}>
              {moment(event.timeRange?.startAt).format('DD')}
            </Text>
          </Flex>
        </Card>
        <Flex direction="column" overflow="hidden" justify="space-between">
          <Heading as="h4" mb={2} color="gray.900">
            {event.title}
          </Heading>
          <Box color="neutral-gray.700">
            {event.themes.length > 0 &&
              formatInfo(CapUIIcon.FolderO, event.themes?.map(({ title }) => title).join(', ') || '', false)}
          </Box>
        </Flex>
      </Card>
    </Box>
  )
}

export default EventCard
