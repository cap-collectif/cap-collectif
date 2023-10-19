import * as React from 'react'
import { MapContainer, Marker } from 'react-leaflet'
import { graphql, useFragment } from 'react-relay'
import moment from 'moment'
import type { IntlShape } from 'react-intl'
import { useIntl } from 'react-intl'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css'
import { GestureHandling } from 'leaflet-gesture-handling'
import { Flex, Text, Box } from '@cap-collectif/ui'
import type { EventPageContent_query$key } from '~relay/EventPageContent_query.graphql'
import WYSIWYGRender from '~/components/Form/WYSIWYGRender'
import useFeatureFlag from '~/utils/hooks/useFeatureFlag'
import useIsMobile from '~/utils/hooks/useIsMobile'
import EventModerationMotive from './EventModerationMotive'
import CommentSectionApp from '~/startup/CommentSectionApp'
import CapcoTileLayer from '~/components/Utils/CapcoTileLayer'
import EventPageProjectList from '~/components/Event/EventPage/EventPageProjectList'
type Props = {
  readonly queryRef: EventPageContent_query$key | null | undefined
}
const FRAGMENT = graphql`
  fragment EventPageContent_query on Query
  @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, eventId: { type: "ID!" }) {
    event: node(id: $eventId) {
      ... on Event {
        id
        body
        timeRange {
          startAt
          endAt
        }
        googleMapsAddress {
          formatted
          lat
          lng
        }
        ...EventPageProjectList_event
        ...EventModerationMotive_event
        commentable
        viewerDidAuthor @include(if: $isAuthenticated)
      }
    }
  }
`
export const Aside = ({ children }: { children: JSX.Element | JSX.Element[] | string }) => (
  <Flex
    direction="column"
    bg={['white', 'neutral-gray.50']}
    className="eventContent__about"
    width={['100%', '405px']}
    p={6}
    position="relative"
  >
    {children}
  </Flex>
)
export const Content = ({ children }: { children: JSX.Element | JSX.Element[] | string }) => {
  const isMobile = useIsMobile()
  return (
    <Flex
      width={isMobile ? '100%' : undefined}
      className={`eventContent ${!isMobile ? 'container' : ''}`}
      position="relative"
      flexDirection={['column', 'row']}
      flexWrap="nowrap"
      justifyContent="center"
      spacing={[0, '56px']}
      mt={[7, '40px']}
      px={0}
    >
      {children}
    </Flex>
  )
}
export const About = ({ children }: { children?: JSX.Element | JSX.Element[] | string }) => {
  const intl = useIntl()
  if (!children) return null
  return (
    <>
      <Text as="span" fontWeight={600} fontSize={5} lineHeight="initial" mb={4}>
        {intl.formatMessage({
          id: 'about-that-event',
        })}
      </Text>
      {typeof children === 'string' ? <WYSIWYGRender className="description" value={children} /> : children}
    </>
  )
}

const renderDate = (startAt: string, endAt: string | null | undefined, intl: IntlShape) => {
  const isSameDay = endAt && moment(startAt).isSame(moment(endAt), 'day')

  const dayAndHourFormatted = (day: string, hour: string) => ({
    [day]: intl.formatDate(startAt, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    [hour]: intl.formatDate(startAt, {
      hour: 'numeric',
      minute: 'numeric',
    }),
  })

  return (
    <>
      <Text as="span" fontWeight={600} fontSize={5} mb={2}>
        {intl.formatMessage({
          id: 'global.admin.published_at',
        })}
      </Text>
      <Text fontSize={3} as="span">
        {!endAt
          ? intl.formatMessage(
              {
                id: 'dayAtHour',
              },
              { ...dayAndHourFormatted('day', 'hour') },
            )
          : null}
        {isSameDay
          ? intl.formatMessage(
              {
                id: 'startHour-to-endHour',
              },
              {
                ...dayAndHourFormatted('day', 'startHour'),
                endHour: intl.formatDate(endAt, {
                  hour: 'numeric',
                  minute: 'numeric',
                }),
              },
            )
          : null}
        {endAt && !isSameDay
          ? intl.formatMessage(
              {
                id: 'fromStartDayToEndDay',
              },
              {
                br: <br />,
                ...dayAndHourFormatted('startDay', 'startHour'),
                endDay: intl.formatDate(endAt, {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }),
                endHour: intl.formatDate(endAt, {
                  hour: 'numeric',
                  minute: 'numeric',
                }),
              },
            )
          : null}
      </Text>
    </>
  )
}

export const EventPageContent = ({ queryRef }: Props) => {
  const query = useFragment(FRAGMENT, queryRef)
  const hasProposeEventEnabled = useFeatureFlag('allow_users_to_propose_events')
  const intl = useIntl()
  React.useEffect(() => {
    L.Map.addInitHook('addHandler', 'gestureHandling', GestureHandling)
  }, [])
  if (!query) return null
  const { event } = query
  if (!event) return null
  const { timeRange, googleMapsAddress, commentable, id } = event
  return (
    <Flex flexDirection="column" flex="1" alignItems="center" px={[4, 0]} bg={['neutral-gray.50', 'white']}>
      <Content>
        <Flex flexDirection="column" flex="1">
          {event.viewerDidAuthor && hasProposeEventEnabled && <EventModerationMotive eventRef={event} />}
          <About>{event.body}</About>
          <EventPageProjectList eventRef={event} />
        </Flex>
        <Flex direction="column" mt={[8, 0]}>
          <Aside>
            {timeRange?.startAt
              ? renderDate(timeRange.startAt.replace(/-/g, '/'), timeRange.endAt?.replace(/-/g, '/'), intl)
              : null}
            {googleMapsAddress && (
              <>
                <Text as="span" fontWeight={600} fontSize={5} mt={8} mb={2}>
                  {intl.formatMessage({
                    id: 'admin.fields.event.group_address',
                  })}
                </Text>
                <Text fontSize={3} as="span">
                  {googleMapsAddress.formatted}
                </Text>
              </>
            )}
          </Aside>
          {googleMapsAddress?.formatted ? (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${googleMapsAddress.formatted.replace(
                / /g,
                '%20',
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              <MapContainer
                center={{
                  lat: googleMapsAddress.lat,
                  lng: googleMapsAddress.lng,
                }}
                zoom={16}
                zoomControl={false}
                style={{
                  width: '100%',
                  height: 250,
                  zIndex: 1,
                }}
                doubleClickZoom={false}
                gestureHandling
              >
                <CapcoTileLayer />
                <Marker
                  position={[googleMapsAddress.lat, googleMapsAddress.lng]}
                  icon={
                    L &&
                    L.icon({
                      iconUrl: '/svg/marker.svg',
                      iconSize: [40, 40],
                      iconAnchor: [20, 40],
                      popupAnchor: [0, -40],
                    })
                  }
                />
              </MapContainer>
            </a>
          ) : null}
        </Flex>
      </Content>
      {commentable ? (
        <Box width={['100%', '40%']} mb={5}>
          <CommentSectionApp commentableId={id || ''} />
        </Box>
      ) : null}
    </Flex>
  )
}
EventPageContent.Content = Content
EventPageContent.About = About
EventPageContent.Aside = Aside
export default EventPageContent
