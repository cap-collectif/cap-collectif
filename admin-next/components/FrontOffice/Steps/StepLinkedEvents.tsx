import {
  Box,
  Button,
  CapUIFontSize,
  CapUIIcon,
  CapUIIconSize,
  Card,
  CardContent,
  CardCover,
  CardCoverImage,
  CardCoverPlaceholder,
  CardStatusTag,
  CardTag,
  CardTagLabel,
  CardTagLeftIcon,
  CardTagList,
  Flex,
  Heading,
  Icon,
  Menu,
  Tag,
  Text,
} from '@cap-collectif/ui'
import { StepLinkedEvents_step$data, StepLinkedEvents_step$key } from '@relay/StepLinkedEvents_step.graphql'
import useIsMobile from '@shared/hooks/useIsMobile'
import moment from 'moment'
import { useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import Slider from 'react-slick'

// shortcut: loads 40 events per period like StepEvents, add pagination if steps exceed this limit.
const FRAGMENT = graphql`
  fragment StepLinkedEvents_step on Step {
    futureEvents: events(first: 40, isFuture: true) {
      totalCount
      edges {
        node {
          ...StepLinkedEvents_event @relay(mask: false)
        }
      }
    }
    pastEvents: events(first: 40, isFuture: false) {
      totalCount
      edges {
        node {
          ...StepLinkedEvents_event @relay(mask: false)
        }
      }
    }
  }
`

graphql`
  fragment StepLinkedEvents_event on Event {
    id
    title
    url
    guestListEnabled
    timeRange {
      startAt
      endAt
    }
    media {
      url(format: "reference")
    }
    themes {
      id
      title
    }
    googleMapsAddress {
      formatted
      json
    }
  }
`

type EventNode = NonNullable<StepLinkedEvents_step$data['futureEvents']['edges'][number]>['node']

const StepEventCard = ({ event, vertical }: { event: EventNode; vertical: boolean }) => {
  const intl = useIntl()
  const { startAt, endAt } = event.timeRange
  const dateLabel = startAt
    ? endAt
      ? intl.formatMessage(
          { id: 'global.dates.between' },
          {
            start: moment(startAt).format('D MMMM'),
            end: moment(endAt).format('D MMMM'),
          },
        )
      : moment(startAt).format('D MMMM YYYY')
    : undefined
  let city: string | undefined
  try {
    const address = event.googleMapsAddress?.json ? JSON.parse(event.googleMapsAddress.json)[0] : null
    city = address?.address_components?.find(
      ({ types }) => types.includes('locality') || types.includes('administrative_area_level_1'),
    )?.long_name
  } catch {
    city = event.googleMapsAddress?.formatted
  }

  return (
    <Card format={vertical ? 'vertical' : 'horizontal'} variantSize="medium" flex="1">
      <CardCover>
        {event.media?.url ? (
          <CardCoverImage src={event.media.url} />
        ) : (
          <CardCoverPlaceholder icon={CapUIIcon.CalendarO} color="primary.base" />
        )}
        {event.guestListEnabled && (
          <CardStatusTag variantColor="success">
            <CardTagLabel>{intl.formatMessage({ id: 'registration-required' })}</CardTagLabel>
          </CardStatusTag>
        )}
      </CardCover>
      <CardContent
        primaryInfo={event.title}
        href={event.url}
        secondaryInfo={dateLabel}
        sx={{
          '& .cap-card-link:focus': { outline: 'none' },
          '& .cap-card-link:focus-visible': { outline: '2px solid', outlineColor: 'primary.base', borderRadius: '2px' },
        }}
      >
        <CardTagList>
          {event.googleMapsAddress && (
            <CardTag>
              <CardTagLeftIcon name={CapUIIcon.PinO} />
              <CardTagLabel>{city}</CardTagLabel>
            </CardTag>
          )}
          {event.themes.length > 0 && (
            <CardTag>
              <CardTagLeftIcon name={CapUIIcon.FolderO} />
              {event.themes.map(theme => (
                <CardTagLabel key={theme.id}>{theme.title}</CardTagLabel>
              ))}
            </CardTag>
          )}
        </CardTagList>
      </CardContent>
    </Card>
  )
}

const StepLinkedEvents = ({ step: stepKey }: { step: StepLinkedEvents_step$key }) => {
  const step = useFragment(FRAGMENT, stepKey)
  const intl = useIntl()
  const isMobile = useIsMobile()
  const slider = useRef<Slider>(null)
  const [isFuture, setIsFuture] = useState(step.futureEvents.totalCount > 0)
  const future = step.futureEvents.edges.flatMap(edge => (edge?.node ? [edge.node] : []))
  const past = step.pastEvents.edges.flatMap(edge => (edge?.node ? [edge.node] : []))
  const events = isFuture ? future : past
  const totalCount = isFuture ? step.futureEvents.totalCount : step.pastEvents.totalCount
  if (!future.length && !past.length) return null

  const mobileSection = (items: EventNode[], count: number, label: string) =>
    count > 0 && (
      <Flex direction="column" gap="md">
        <Heading as="h2" fontSize={CapUIFontSize.Headline} color="black">
          {intl.formatMessage({ id: label }, { num: count })}
        </Heading>
        {/* Native horizontal scroll: the next card peeks out to hint that the list is scrollable */}
        <Flex as="ul" gap="md" overflowX="auto" sx={{ scrollSnapType: 'x mandatory', listStyle: 'none', p: 0, m: 0 }}>
          {items.map(event => (
            <Flex
              as="li"
              key={event.id}
              flex={items.length > 1 ? '0 0 85%' : '0 0 100%'}
              sx={{ scrollSnapAlign: 'start' }}
            >
              <StepEventCard event={event} vertical />
            </Flex>
          ))}
        </Flex>
      </Flex>
    )

  return (
    <Box as="section" id="StepEvents" aria-label={intl.formatMessage({ id: 'global.events' })}>
      {isMobile ? (
        <Flex direction="column" gap="xl">
          {mobileSection(future, step.futureEvents.totalCount, 'front.step.linked-events.future-count')}
          {mobileSection(past, step.pastEvents.totalCount, 'front.step.linked-events.past-count')}
        </Flex>
      ) : (
        <>
          <Flex justify="space-between" align="center" mb="xs">
            <Flex align="center" gap="lg">
              <Heading as="h2" fontSize={CapUIFontSize.Headline} color="black">
                {intl.formatMessage({ id: 'front.step.linked-events.count' }, { num: totalCount })}
              </Heading>
              <Menu
                disclosure={
                  <Button variant="tertiary" rightIcon={CapUIIcon.ArrowDown}>
                    {intl.formatMessage({ id: isFuture ? 'theme.show.status.future' : 'finished' })}
                  </Button>
                }
              >
                <Menu.List>
                  <Menu.Item onClick={() => setIsFuture(true)}>
                    {intl.formatMessage({ id: 'theme.show.status.future' })}
                  </Menu.Item>
                  <Menu.Item onClick={() => setIsFuture(false)}>{intl.formatMessage({ id: 'finished' })}</Menu.Item>
                </Menu.List>
              </Menu>
            </Flex>
            {totalCount > 1 && (
              <Flex gap="xs">
                <Tag
                  as="button"
                  variantColor="infoGray"
                  transparent
                  onClick={() => slider.current?.slickPrev()}
                  aria-label={intl.formatMessage({ id: 'global.previous' })}
                >
                  <Icon name={CapUIIcon.ArrowLeft} size={CapUIIconSize.Md} />
                </Tag>
                <Tag
                  as="button"
                  variantColor="infoGray"
                  transparent
                  onClick={() => slider.current?.slickNext()}
                  aria-label={intl.formatMessage({ id: 'global.next' })}
                >
                  <Icon name={CapUIIcon.ArrowRight} size={CapUIIconSize.Md} />
                </Tag>
              </Flex>
            )}
          </Flex>
          {events.length === 1 ? (
            <Flex justify="flex-start">
              <Box width="60%" pr="15px">
                <StepEventCard event={events[0]} vertical={false} />
              </Box>
            </Flex>
          ) : events.length ? (
            <Box sx={{ '.slick-slide > div': { paddingRight: '15px' } }}>
              <Slider
                key={String(isFuture)}
                ref={slider}
                dots={false}
                infinite={false}
                speed={500}
                arrows={false}
                slidesToShow={1.667}
              >
                {events.map(event => (
                  <StepEventCard key={event.id} event={event} vertical={false} />
                ))}
              </Slider>
            </Box>
          ) : (
            <Text>{intl.formatMessage({ id: 'no_events_message' })}</Text>
          )}
        </>
      )}
    </Box>
  )
}

export default StepLinkedEvents
