import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { Flex, Box, Text, Avatar, Icon, CapUIIconSize, Tag, CapUIFontSize } from '@cap-collectif/ui'
import type { EventPageHeader_query$key, EventReviewStatus } from '~relay/EventPageHeader_query.graphql'
import ProjectHeaderShareButtons from '~/components/Project/ProjectHeaderShareButtons'
import { Authors } from '~/components/Ui/Project/ProjectHeader.Cover'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import EventDefaultCover from './EventDefaultCover'
import useIsMobile from '~/utils/hooks/useIsMobile'
import EventActions from './EventActions'
import { EventQuickActions } from './EventQuickActions'
import ProjectHeaderThemeList from '~/components/Project/ProjectHeaderThemeList'
import Image from '~ui/Primitives/Image'
import { dispatchNavBarEvent } from '@shared/navbar/NavBar.utils'
type Props = {
  readonly queryRef: EventPageHeader_query$key | null | undefined
}
const FRAGMENT = graphql`
  fragment EventPageHeader_query on Query
  @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, eventId: { type: "ID!" }) {
    ...EventActions_query @arguments(isAuthenticated: $isAuthenticated, eventId: $eventId)
    event: node(id: $eventId) {
      ... on Event {
        id
        title
        url
        media {
          url
        }
        author {
          id
          username
          url
          avatarUrl
        }
        review {
          status
        }
        participants {
          totalCount
        }
        viewerDidAuthor @include(if: $isAuthenticated)
        timeRange {
          startAt
        }
        themes {
          title
          url
          id
        }
        review {
          status
        }
      }
    }
    viewer @include(if: $isAuthenticated) {
      id
      isAdmin
    }
  }
`

const Content = ({ children }: { readonly children: JSX.Element | JSX.Element[] | string }) => (
  <Box
    className="eventHeader__cover__content"
    position="relative"
    display="flex"
    flexDirection="column"
    minHeight={['auto', '270px']}
    justifyContent="flex-start"
    alignItems="flex-start"
    paddingLeft={[4, 0]}
    paddingRight={[4, 6]}
    width={['100%', 'calc(100% - 405px)']}
  >
    {children}
  </Box>
)

export const Cover = ({
  src,
}: {
  readonly src?: string | null | undefined
  readonly alt?: string | null | undefined
}) =>
  src ? (
    <Box
      className="eventHeader__cover"
      width={['100%', '405px']}
      borderRadius={[0, 'accordion']}
      overflow="hidden"
      minHeight="270px"
      maxHeight="315px"
    >
      <Image
        useDs
        src={src}
        alt=""
        width={['100%', '405px']}
        height="100%"
        minHeight="270px"
        style={{
          objectFit: 'cover',
        }}
        loading="eager"
        sizes="(max-width: 320px) 320px,
        (max-width: 640px) 640px,
        (max-width: 960px) 960px,
        (max-width: 1280px) 960px,
        (max-width: 2560px) 960px,"
      />
    </Box>
  ) : (
    <EventDefaultCover />
  )
export const Title = ({ children }: { children: JSX.Element | JSX.Element[] | string }) => (
  <Text
    className="eventHeader__title"
    width="100%"
    as="h3"
    fontSize={[CapUIFontSize.DisplaySmall, CapUIFontSize.DisplayMedium]}
    lineHeight="initial"
    fontWeight="semibold"
    color="neutral-gray.900"
    marginTop={2}
    truncate={130}
  >
    {children}
  </Text>
)
export const Info = ({
  date,
  participants,
  themes,
}: {
  readonly date: string | null | undefined
  readonly participants: number | null | undefined
  readonly themes: void | ReadonlyArray<{
    readonly title: string
    readonly id: string
    readonly url: string
  }>
}) => {
  const intl = useIntl()
  return (
    <Flex className="eventHeader__info" direction={['column', 'row']} mt={4} flexWrap="wrap">
      <Flex>
        {date ? (
          <Flex spacing={1} mr={7}>
            <Icon name="CALENDAR_O" size={CapUIIconSize.Md} color="neutral-gray.700" />
            <Text>
              {intl.formatDate(date.replace(/-/g, '/'), {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </Flex>
        ) : null}
        {participants ? (
          <Flex spacing={1} mr={7}>
            <Icon name="USER_O" size={CapUIIconSize.Md} color="neutral-gray.700" />
            <Text>
              {intl.formatMessage(
                {
                  id: 'n-members',
                },
                {
                  num: participants,
                },
              )}
            </Text>
          </Flex>
        ) : null}
      </Flex>
      {themes ? <ProjectHeaderThemeList breakingNumber={3} themes={themes} eventView /> : null}
    </Flex>
  )
}
export const Header = ({ children }: { children: JSX.Element | JSX.Element[] | string }) => {
  const isMobile = useIsMobile()
  return (
    <Flex
      className="eventHeader"
      bg="neutral-gray.50"
      position="relative"
      flexWrap="nowrap"
      width="100%"
      justifyContent="center"
    >
      <Flex
        className={!isMobile && 'container'}
        px={0}
        py={[0, 10]}
        flexDirection={['column-reverse', 'row']}
        flexWrap="nowrap"
      >
        {children}
      </Flex>
    </Flex>
  )
}

const getLabelColor = (status: EventReviewStatus | null | undefined) => {
  switch (status) {
    case 'APPROVED':
      return 'green'

    case 'AWAITING':
      return 'orange'

    default:
      return 'red'
  }
}

const getLabelMessage = (status: EventReviewStatus | null | undefined) => {
  switch (status) {
    case 'APPROVED':
      return 'approved'

    case 'AWAITING':
      return 'waiting-examination'

    default:
      return 'refused'
  }
}

export const EventPageHeader = ({ queryRef }: Props) => {
  const query = useFragment(FRAGMENT, queryRef)
  const intl = useIntl()
  const profilesToggle = useFeatureFlag('profiles')
  const hasProposeEventEnabled = useFeatureFlag('allow_users_to_propose_events')
  const isMobile = useIsMobile()

  React.useEffect(() => {
    dispatchNavBarEvent('set-breadcrumb', [
      { title: intl.formatMessage({ id: 'navbar.homepage' }), href: '/' },
      { title: intl.formatMessage({ id: 'global.events' }), href: '/events' },
      { title: query?.event?.title, href: '' },
    ])
  }, [query, intl])

  if (!query) return null
  const { event, viewer } = query
  if (!event || !event.id) return null
  const { author, timeRange, participants, viewerDidAuthor, review, id, title, url, themes } = event
  const isUserEvent = viewer && !viewer.isAdmin && hasProposeEventEnabled && viewerDidAuthor && review?.status
  return (
    <Header>
      <Content>
        <Flex justifyContent="space-between" width="100%" alignItems="center" mt={[isUserEvent ? 5 : 0, 0]}>
          {isUserEvent ? (
            <Tag variantColor={getLabelColor(review?.status)} id="event-label-status">
              <Tag.Label>
                {intl.formatMessage({
                  id: getLabelMessage(review?.status),
                })}
              </Tag.Label>
            </Tag>
          ) : (
            <Authors
              active={profilesToggle}
              style={{
                cursor: profilesToggle ? 'pointer' : 'default',
              }}
              onClick={() => (profilesToggle ? window.open(author?.url, '_self') : null)}
              authors={author ? [author] : null}
            >
              <Avatar key={author?.id} name={author?.username} src={author?.avatarUrl} />
            </Authors>
          )}
          <Flex alignItems="center" height={6}>
            {isMobile ? (
              <ProjectHeaderShareButtons url={url || ''} title={title || ''} position="relative" marginTop={0} />
            ) : null}
            <EventQuickActions id={id} status={review?.status} viewerDidAuthor={viewerDidAuthor} />
          </Flex>
        </Flex>
        <Title>{event.title || ''}</Title>
        <Info date={timeRange?.startAt} participants={participants?.totalCount || 0} themes={themes} />
        <EventActions queryRef={query} />
        {!isMobile ? <ProjectHeaderShareButtons url={url || ''} title={title || ''} /> : null}
      </Content>
      <Cover src={event.media?.url} />
    </Header>
  )
}
EventPageHeader.Header = Header
EventPageHeader.Content = Content
EventPageHeader.Cover = Cover
EventPageHeader.Title = Title
export default EventPageHeader
