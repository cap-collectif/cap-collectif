import * as React from 'react'
import { useLazyLoadQuery, graphql } from 'react-relay'
import type { OrganizationPageQuery } from '~relay/OrganizationPageQuery.graphql'
import AppBox from '~/components/Ui/Primitives/AppBox'
import Flex from '~/components/Ui/Primitives/Layout/Flex'
import Heading from '~/components/Ui/Primitives/Heading'
import Text from '~/components/Ui/Primitives/Text'
import OrganizationPageProjectList from './OrganizationPageProjectList'
import OrganizationPageEventList from './OrganizationPageEventList'
import OrganizationPagePostList from './OrganizationPagePostList'
import ProjectHeader from '~/components/Ui/Project/ProjectHeaderLegacy'
import Button from '~/components/DesignSystem/Button/Button'
import Menu from '~ds/Menu/Menu'
import Image from '~ui/Primitives/Image'
import { useIntl } from 'react-intl'
import { useState } from 'react'
import WYSIWYGRender from '~/components/Form/WYSIWYGRender'
import Loader from '~ui/FeedbacksIndicators/Loader'
import Icon, { ICON_NAME } from '~ui/Icons/Icon'
const QUERY = graphql`
  query OrganizationPageQuery(
    $organizationId: ID!
    $count: Int!
    $cursorProjects: String
    $cursorPosts: String
    $cursorEvents: String
    $hideDeletedEvents: Boolean
    $hideUnpublishedEvents: Boolean
    $hideUnpublishedPosts: Boolean
    $isFuture: Boolean
  ) {
    organization: node(id: $organizationId) {
      ... on Organization {
        id
        title
        body
        logo {
          url
        }
        socialNetworks {
          webPageUrl
          facebookUrl
          twitterUrl
        }
        banner {
          url
        }
        media {
          url
        }
        url
        projectsCount: projects {
          totalCount
        }
        eventsCount: events(hideDeletedEvents: $hideDeletedEvents, hideUnpublishedEvents: $hideUnpublishedEvents) {
          totalCount
        }
        postsCount: posts(hideUnpublishedPosts: $hideUnpublishedPosts) {
          totalCount
        }
        eventsFuture: events(
          isFuture: true
          hideDeletedEvents: $hideDeletedEvents
          hideUnpublishedEvents: $hideUnpublishedEvents
        ) {
          totalCount
        }
        eventsPast: events(
          isFuture: false
          hideDeletedEvents: $hideDeletedEvents
          hideUnpublishedEvents: $hideUnpublishedEvents
        ) {
          totalCount
        }
        eventsWithoutFilters: events(
          isFuture: null
          hideDeletedEvents: $hideDeletedEvents
          hideUnpublishedEvents: $hideUnpublishedEvents
        ) {
          totalCount
        }
        ...OrganizationPageProjectList_organization @arguments(count: $count, cursor: $cursorProjects)
        ...OrganizationPageEventList_organization
          @arguments(
            count: $count
            cursor: $cursorEvents
            hideDeletedEvents: $hideDeletedEvents
            hideUnpublishedEvents: $hideUnpublishedEvents
            isFuture: $isFuture
          )
        ...OrganizationPagePostList_organization
          @arguments(count: $count, cursor: $cursorPosts, hideUnpublishedPosts: $hideUnpublishedPosts)
      }
    }
  }
`
export type Props = {
  readonly organizationId: string
}
export const OrganizationPage = ({ organizationId }: Props) => {
  const query = useLazyLoadQuery<OrganizationPageQuery>(QUERY, {
    organizationId,
    count: 3,
    cursorProjects: null,
    cursorPosts: null,
    cursorEvents: null,
    hideDeletedEvents: true,
    hideUnpublishedEvents: true,
    hideUnpublishedPosts: true,
    isFuture: undefined,
  })

  const statusFilter = query.organization.eventsFuture.totalCount > 0 ? 'theme.show.status.future' : 'finished'
  const { organization } = query
  const { postsCount, eventsCount, socialNetworks, title, body, projectsCount } = organization
  const hasProjects = !!projectsCount?.totalCount
  const hasPosts = !!postsCount?.totalCount
  const hasEvents = !!eventsCount?.totalCount
  const cover = organization.banner?.url
  const logo = organization.media?.url
  const fullSizeLayout = !hasPosts && !hasEvents
  const [filter, setFilter] = useState(statusFilter)

  const intl = useIntl()
  if (!query || !query.organization) return null

  return (
    <Flex direction="column">
      <Flex as="section" id="organizationHeader" bg="white">
        <Flex
          maxWidth="1200px"
          width="100%"
          margin="auto"
          justify="space-between"
          bg="white"
          p={[0, 8]}
          direction={['column-reverse', 'row']}
        >
          <Flex direction="column" maxWidth="550px" p={[4, 0]}>
            <Heading as="h1" mb={6} fontSize="32px" lineHeight="44px">
              {title}
            </Heading>
            <Text as="div">
              <WYSIWYGRender value={body} />
            </Text>
            {socialNetworks ? (
              <Flex
                flexDirection="row"
                maxHeight="24px"
                width="100%"
                flexBasis="100%"
                alignItems="center"
                marginTop={[9, 6]}
              >
                {socialNetworks.facebookUrl ? (
                  <ProjectHeader.Social href={socialNetworks.facebookUrl} name="FACEBOOK" />
                ) : null}
                {socialNetworks.twitterUrl ? (
                  <ProjectHeader.Social href={socialNetworks.twitterUrl} name="TWITTER" />
                ) : null}
                {socialNetworks.webPageUrl ? (
                  <ProjectHeader.Social href={socialNetworks.webPageUrl} name="LINK" />
                ) : null}
              </Flex>
            ) : null}
          </Flex>
          {cover || logo ? (
            <AppBox
              borderRadius="8px"
              position="relative"
              overflow="hidden"
              css={{
                filter: 'drop-shadow(0px 10px 50px rgba(0, 0, 0, 0.15))',
              }}
            >
              <Image
                src={cover || logo}
                alt="banner"
                width={['100%', '405px']}
                borderRadius={[0, 'accordion']}
                overflow="hidden"
                minHeight={['unset', '270px']}
                css={{
                  objectFit: !cover ? 'contain' : 'cover',
                }}
                maxHeight="315px"
                loading="eager"
                sizes="(max-width: 320px) 320px,
        (max-width: 640px) 640px,
        (max-width: 960px) 960px,
        (max-width: 1280px) 960px,
        (max-width: 2560px) 960px,"
              />
              {cover && logo ? (
                <AppBox
                  bg="white"
                  p={2}
                  width="120px"
                  height="80px"
                  position="absolute"
                  top={0}
                  right={0}
                  css={{
                    borderBottomLeftRadius: 8,
                  }}
                >
                  <Image
                    src={logo}
                    alt="logo"
                    width="104px"
                    height="64px"
                    css={{
                      objectFit: 'contain',
                    }}
                    loading="eager"
                    sizes="(max-width: 320px) 320px,
        (max-width: 640px) 320px,
        (max-width: 960px) 320px,
        (max-width: 1280px) 320px,
        (max-width: 2560px) 320px,"
                  />
                </AppBox>
              ) : null}
            </AppBox>
          ) : null}
        </Flex>
      </Flex>
      <Flex as="section" id="organizationContent" bg="neutral-gray.50">
        <Flex maxWidth="1200px" width="100%" margin="auto" justify="space-between" p={8} direction={['column', 'row']}>
          {hasProjects ? (
            <OrganizationPageProjectList organization={organization} fullSizeLayout={fullSizeLayout} />
          ) : null}
          {!fullSizeLayout ? (
            <Flex direction="column" width={['100%', '30%']}>
              {hasPosts ? <OrganizationPagePostList organization={organization} /> : null}
              {hasEvents ? (
                <Flex direction="column" maxWidth={['100%', '380px']} width="100%">
                  <Flex direction="row" justify="space-between">
                    <Heading as="h4" mb={4}>
                      {intl.formatMessage({
                        id: 'homepage.section.events',
                      })}
                    </Heading>
                    <Menu>
                      <Menu.Button>
                        <Button>
                          <div style={{ marginRight: '4px' }}>{intl.formatMessage({ id: filter })}</div>
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
                    <OrganizationPageEventList organization={organization} filter={filter} />
                  </React.Suspense>
                </Flex>
              ) : null}
            </Flex>
          ) : null}
        </Flex>
      </Flex>
    </Flex>
  )
}
export default OrganizationPage
