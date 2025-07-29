'use client'

import { Button, CapUIFontSize, CapUIIcon, Flex, Heading, Menu, Spinner, Text } from '@cap-collectif/ui'
import OrganizationPageEventList from '@components/FrontOffice/Organization/OrganizationPageEventList'
import OrganizationPageHeader from '@components/FrontOffice/Organization/OrganizationPageHeader'
import OrganizationPagePostList from '@components/FrontOffice/Organization/OrganizationPagePostList'
import OrganizationPageProjectList from '@components/FrontOffice/Organization/OrganizationPageProjectList'
import { OrganizationQuery } from '@relay/OrganizationQuery.graphql'
import { pageOrganizationMetadataQuery$data } from '@relay/pageOrganizationMetadataQuery.graphql'
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
    isFuture: true,
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
                  <Heading as="h2" color="neutral-gray.darker" fontSize={CapUIFontSize.BodyLarge}>
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
  )
}

export const Organization: FC<Props & { organization: pageOrganizationMetadataQuery$data['organization'] }> = ({
  slug,
  organization,
}) => (
  <Flex direction="column">
    <OrganizationPageHeader organization={organization} />
    <Suspense fallback={<Spinner m="auto" my="10rem" />}>
      <OrganizationRender slug={slug} />
    </Suspense>
  </Flex>
)

export default Organization
