'use client'

import { Button, CapUIIcon, Flex, Heading, Menu, Spinner, Text } from '@cap-collectif/ui'
import OrganizationPageEventList from '@components/Frontend/Organization/OrganizationPageEventList'
import OrganizationPageHeader from '@components/Frontend/Organization/OrganizationPageHeader'
import OrganizationPagePlaceholder from '@components/Frontend/Organization/OrganizationPagePlaceholder'
import OrganizationPagePostList from '@components/Frontend/Organization/OrganizationPagePostList'
import OrganizationPageProjectList from '@components/Frontend/Organization/OrganizationPageProjectList'
import { OrganizationQuery } from '@relay/OrganizationQuery.graphql'
import { useNavBarContext } from '@shared/navbar/NavBar.context'
import { pxToRem } from '@shared/utils/pxToRem'
import { FC, Suspense, useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'

type Props = {
  slug: string
}

const organizationQuery = graphql`
  query OrganizationQuery(
    $organizationSlug: String!
    $count: Int!
    $cursorProjects: String
    $cursorPosts: String
    $cursorEvents: String
    $isFuture: Boolean
  ) {
    organization: nodeSlug(entity: ORGANIZATION, slug: $organizationSlug) {
      ... on Organization {
        ...OrganizationPageHeader_organization
        id
        title
        projectsCount: projects {
          totalCount
        }
        eventsCount: events(hideDeletedEvents: true, hideUnpublishedEvents: true) {
          totalCount
        }
        postsCount: posts(hideUnpublishedPosts: true) {
          totalCount
        }
        eventsFuture: events(isFuture: true, hideDeletedEvents: true, hideUnpublishedEvents: true) {
          totalCount
        }
        ...OrganizationPageProjectList_organization @arguments(count: $count, cursor: $cursorProjects)
        ...OrganizationPageEventList_organization @arguments(count: $count, cursor: $cursorEvents, isFuture: $isFuture)
        ...OrganizationPagePostList_organization @arguments(count: $count, cursor: $cursorPosts)
      }
    }
  }
`

export const OrganizationRender: FC<Props> = ({ slug }) => {
  const intl = useIntl()
  const { setBreadCrumbItems } = useNavBarContext()
  const query = useLazyLoadQuery<OrganizationQuery>(organizationQuery, {
    organizationSlug: slug,
    count: 3,
    cursorProjects: null,
    cursorPosts: null,
    cursorEvents: null,
    isFuture: undefined,
  })

  const { organization } = query

  useEffect(() => {
    setBreadCrumbItems([
      { title: intl.formatMessage({ id: 'navbar.homepage' }), href: '/' },
      { title: organization.title, href: '' },
    ])
  }, [intl, setBreadCrumbItems, organization])

  const statusFilter = organization.eventsFuture.totalCount > 0 ? 'theme.show.status.future' : 'finished'
  const { postsCount, eventsCount, projectsCount } = organization
  const hasProjects = !!projectsCount?.totalCount
  const hasPosts = !!postsCount?.totalCount
  const hasEvents = !!eventsCount?.totalCount
  const fullSizeLayout = !hasPosts && !hasEvents
  const [filter, setFilter] = useState(statusFilter)

  return (
    <Flex direction="column">
      <OrganizationPageHeader organization={organization} />
      <Flex as="section" id="organizationContent" bg="neutral-gray.50">
        <Flex
          maxWidth={pxToRem(1280)}
          width="100%"
          margin="auto"
          justify="space-between"
          py={8}
          px={[4, 6]}
          direction={['column', 'row']}
        >
          {hasProjects ? (
            <OrganizationPageProjectList organization={organization} fullSizeLayout={fullSizeLayout} />
          ) : null}
          {!fullSizeLayout ? (
            <Flex direction="column" width={['100%', '30%']}>
              {hasPosts ? <OrganizationPagePostList organization={organization} /> : null}
              {hasEvents ? (
                <Flex direction="column" maxWidth={['100%', pxToRem(380)]} width="100%">
                  <Flex direction="row" justify="space-between" mb={4}>
                    <Heading as="h4">
                      {intl.formatMessage({
                        id: 'homepage.section.events',
                      })}
                    </Heading>
                    <Menu
                      disclosure={
                        <Button rightIcon={CapUIIcon.ArrowDown} variant="tertiary">
                          {intl.formatMessage({ id: filter })}
                        </Button>
                      }
                    >
                      <Menu.List>
                        <Menu.Item
                          onClick={() => {
                            setFilter('theme.show.status.future')
                          }}
                        >
                          <Text color="gray.900">{intl.formatMessage({ id: 'theme.show.status.future' })}</Text>
                        </Menu.Item>
                        <Menu.Item
                          onClick={() => {
                            setFilter('finished')
                          }}
                        >
                          <Text color="gray.900">{intl.formatMessage({ id: 'finished' })}</Text>
                        </Menu.Item>
                      </Menu.List>
                    </Menu>
                  </Flex>
                  <Suspense fallback={<Spinner mx="auto" />}>
                    <OrganizationPageEventList organization={organization} filter={filter} />
                  </Suspense>
                </Flex>
              ) : null}
            </Flex>
          ) : null}
        </Flex>
      </Flex>
    </Flex>
  )
}

export const Organization: FC<Props> = ({ slug }) => (
  <Suspense fallback={<OrganizationPagePlaceholder />}>
    <OrganizationRender slug={slug} />
  </Suspense>
)

export default Organization
