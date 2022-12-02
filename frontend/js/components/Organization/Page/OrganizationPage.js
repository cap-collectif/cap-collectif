// @flow
import * as React from 'react';
import { useLazyLoadQuery, graphql } from 'react-relay';
import type { OrganizationPageQuery } from '~relay/OrganizationPageQuery.graphql';
import AppBox from '~/components/Ui/Primitives/AppBox';
import Flex from '~/components/Ui/Primitives/Layout/Flex';
import Heading from '~/components/Ui/Primitives/Heading';
import Text from '~/components/Ui/Primitives/Text';
import OrganizationPageProjectList from './OrganizationPageProjectList';
import OrganizationPageEventList from './OrganizationPageEventList';
import OrganizationPagePostList from './OrganizationPagePostList';
import ProjectHeader from '~/components/Ui/Project/ProjectHeaderLegacy';

const QUERY = graphql`
  query OrganizationPageQuery(
    $organizationId: ID!
    $count: Int!
    $cursorProjects: String
    $cursorPosts: String
    $cursorEvents: String
    $projectVisibilityFilter: ProjectVisibility
    $hideDeletedEvents: Boolean
    $hideUnpublishedEvents: Boolean
    $hideUnpublishedPosts: Boolean
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
        projectsCount: projects(visibilityFilter: $projectVisibilityFilter) {
          totalCount
        }
        eventsCount: events(
          hideDeletedEvents: $hideDeletedEvents
          hideUnpublishedEvents: $hideUnpublishedEvents
        ) {
          totalCount
        }
        postsCount: posts(hideUnpublishedPosts: $hideUnpublishedPosts) {
          totalCount
        }
        ...OrganizationPageProjectList_organization
          @arguments(
            count: $count
            cursor: $cursorProjects
            visibilityFilter: $projectVisibilityFilter
          )
        ...OrganizationPageEventList_organization
          @arguments(
            count: $count
            cursor: $cursorEvents
            hideDeletedEvents: $hideDeletedEvents
            hideUnpublishedEvents: $hideUnpublishedEvents
          )
        ...OrganizationPagePostList_organization
          @arguments(
            count: $count
            cursor: $cursorPosts
            hideUnpublishedPosts: $hideUnpublishedPosts
          )
      }
    }
  }
`;

export type Props = {| +organizationId: string |};

export const OrganizationPage = ({ organizationId }: Props) => {
  const query = useLazyLoadQuery<OrganizationPageQuery>(QUERY, {
    organizationId,
    count: 3,
    cursorProjects: null,
    cursorPosts: null,
    cursorEvents: null,
    projectVisibilityFilter: 'PUBLIC',
    hideDeletedEvents: true,
    hideUnpublishedEvents: true,
    hideUnpublishedPosts: true,
  });

  if (!query || !query.organization) return null;

  const { organization } = query;

  const { postsCount, eventsCount, socialNetworks, title, body, projectsCount } = organization;

  const hasProjects = !!projectsCount?.totalCount;
  const hasPosts = !!postsCount?.totalCount;
  const hasEvents = !!eventsCount?.totalCount;

  const cover = organization.banner?.url;
  const logo = organization.media?.url;

  const fullSizeLayout = !hasPosts && !hasEvents;

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
          direction={['column-reverse', 'row']}>
          <Flex direction="column" maxWidth="550px" p={[4, 0]}>
            <Heading as="h1" mb={6}>
              {title}
            </Heading>
            <Text as="div">{body}</Text>
            {socialNetworks ? (
              <Flex
                flexDirection="row"
                maxHeight="24px"
                width="100%"
                flexBasis="100%"
                alignItems="center"
                marginTop={[9, 6]}>
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
              css={{ filter: 'drop-shadow(0px 10px 50px rgba(0, 0, 0, 0.15))' }}>
              <AppBox
                as="img"
                src={cover || logo}
                alt="banner"
                width={['100%', '405px']}
                borderRadius={[0, 'accordion']}
                overflow="hidden"
                minHeight={['unset', '270px']}
                css={{
                  objectFit: 'cover',
                }}
                maxHeight="315px"
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
                  css={{ borderBottomLeftRadius: 8 }}>
                  <AppBox
                    as="img"
                    src={logo}
                    alt="logo"
                    width="104px"
                    height="64px"
                    css={{
                      objectFit: 'cover',
                    }}
                  />
                </AppBox>
              ) : null}
            </AppBox>
          ) : null}
        </Flex>
      </Flex>
      <Flex as="section" id="organizationContent" bg="neutral-gray.50">
        <Flex
          maxWidth="1200px"
          width="100%"
          margin="auto"
          justify="space-between"
          p={8}
          direction={['column', 'row']}>
          {hasProjects ? (
            <OrganizationPageProjectList
              organization={organization}
              fullSizeLayout={fullSizeLayout}
            />
          ) : null}
          {!fullSizeLayout ? (
            <Flex direction="column" width={['100%', '30%']}>
              {hasEvents ? <OrganizationPageEventList organization={organization} /> : null}
              {hasPosts ? <OrganizationPagePostList organization={organization} /> : null}
            </Flex>
          ) : null}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default OrganizationPage;
