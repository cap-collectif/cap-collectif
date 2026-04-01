'use client'

import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import { Avatar, Box, CapUIIcon, CapUILineHeight, EntityPlaceholder, Flex, Heading, Tag } from '@cap-collectif/ui'
import { ProjectPageHero_project$key } from '@relay/ProjectPageHero_project.graphql'
import { ProjectPageHero_query$key } from '@relay/ProjectPageHero_query.graphql'
import Image, { getSrcSet } from '@shared/ui/Image'
import { pxToRem } from '@shared/utils/pxToRem'
import ShareButtons from '../SocialNetworks/ShareButtons'
import ProjectPageHeroStats from './ProjectPageHeroStats'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'

const QUERY_FRAGMENT = graphql`
  fragment ProjectPageHero_query on Query {
    defaultAvatar: siteImage(keyname: "image.default_avatar") {
      media {
        url
      }
    }
  }
`

const FRAGMENT = graphql`
  fragment ProjectPageHero_project on Project {
    id
    title
    url
    cover {
      url
    }
    archived
    status
    authors {
      __typename
      id
      url
      username
      ... on User {
        media {
          url
        }
      }
    }
    themes {
      id
      title
    }
    address {
      formatted
    }
    districts {
      totalCount
      edges {
        node {
          id
          name
        }
      }
    }
    ...ProjectPageHeroStats_project
  }
`

type Props = {
  project: ProjectPageHero_project$key
  query: ProjectPageHero_query$key
}

const ProjectPageHero: React.FC<Props> = ({ project: projectKey, query: queryKey }) => {
  const intl = useIntl()
  const profiles = useFeatureFlag('profiles')
  const project = useFragment(FRAGMENT, projectKey)
  const { defaultAvatar } = useFragment(QUERY_FRAGMENT, queryKey)

  const { title, cover, url, archived, status, authors, themes, address, districts } = project

  const renderStatusTag = () => {
    if (archived)
      return (
        <Tag variantColor="infoGray" position="absolute" top="xs" left="xs">
          <Tag.Label>{intl.formatMessage({ id: 'global-archived' })}</Tag.Label>
        </Tag>
      )

    if (status === 'FUTURE_WITHOUT_FINISHED_STEPS' || status === 'FUTURE_WITH_FINISHED_STEPS')
      return (
        <Tag variantColor="info" position="absolute" top="xs" left="xs">
          <Tag.LeftIcon name={CapUIIcon.CalendarO} />
          <Tag.Label>{intl.formatMessage({ id: 'step.status.future' })}</Tag.Label>
        </Tag>
      )

    if (status === 'CLOSED')
      return (
        <Tag variantColor="infoGray" position="absolute" top="xs" left="xs">
          <Tag.Label>{intl.formatMessage({ id: 'global.ended' })}</Tag.Label>
        </Tag>
      )

    if (status === 'OPENED_PARTICIPATION')
      return (
        <Tag variantColor="success" position="absolute" top="xs" left="xs">
          <Tag.LeftIcon name={CapUIIcon.BubbleO} />
          <Tag.Label>{intl.formatMessage({ id: 'step.status.open.participation' })}</Tag.Label>
        </Tag>
      )

    if (status === 'OPENED')
      return (
        <Tag variantColor="success" position="absolute" top="xs" left="xs">
          <Tag.LeftIcon name={CapUIIcon.HourglassO} />
          <Tag.Label>{intl.formatMessage({ id: 'global.in-progress' })}</Tag.Label>
        </Tag>
      )

    return null
  }

  return (
    <Box backgroundColor="white" as="header" role="banner">
      <Flex
        maxWidth={pxToRem(1280)}
        width="100%"
        margin="auto"
        py={8}
        pt={[0, 8]}
        px={[0, 4, 6]}
        gap="lg"
        direction={['column', 'row']}
        alignItems={['flex-start', 'center']}
      >
        {/* Cover image */}
        <Box
          flexShrink={0}
          width={['100%', pxToRem(576)]}
          height={pxToRem(384)}
          borderRadius="accordion"
          overflow="hidden"
          position="relative"
          sx={{ border: '1px solid', borderColor: 'neutral-gray.200' }}
        >
          {cover?.url ? (
            <Image
              {...getSrcSet(cover.url)}
              alt=""
              width="100%"
              height="100%"
              loading="eager"
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 640px) 640px, 960px"
            />
          ) : (
            <EntityPlaceholder icon={CapUIIcon.FolderO} scale="3" color="primary.base" />
          )}
          {renderStatusTag()}
        </Box>

        {/* Project info */}
        <Flex direction="column" gap="md" flex="1" p={[0, 4]}>
          <Heading as="h1" fontWeight="normal" fontSize="displaySmall" lineHeight={CapUILineHeight.L}>
            {title}
          </Heading>

          {/* Stats (votes, contributions, participants) */}
          <ProjectPageHeroStats project={project} />

          {/* Location, themes, authors */}
          <Flex wrap="wrap" gap="md">
            {address?.formatted && (
              <Tag transparent variantColor="infoGray" px={0}>
                <Tag.LeftIcon name={CapUIIcon.PinO} />
                <Tag.Label>{address.formatted}</Tag.Label>
              </Tag>
            )}
            {districts?.edges?.map(edge =>
              edge?.node ? (
                <Tag key={edge.node.id} transparent variantColor="infoGray" px={0}>
                  <Tag.LeftIcon name={CapUIIcon.PinO} />
                  <Tag.Label>{edge.node.name}</Tag.Label>
                </Tag>
              ) : null,
            )}
            {themes?.map(theme => (
              <Tag key={theme.id} transparent variantColor="infoGray" px={0}>
                <Tag.LeftIcon name={CapUIIcon.FolderO} />
                <Tag.Label>{theme.title}</Tag.Label>
              </Tag>
            ))}
            {authors?.map(author => (
              <Tag key={author.id} transparent variantColor="infoGray" px={0}>
                <Avatar
                  size="xs"
                  name={author.username ?? ''}
                  src={(author as any).media?.url || defaultAvatar?.media?.url}
                  mr={1}
                />
                <Tag.Label>
                  {profiles || author.__typename === 'Organization' ? (
                    <Box as="a" href={author.url} color="primary.darker">
                      {author.username}
                    </Box>
                  ) : (
                    author.username
                  )}
                </Tag.Label>
              </Tag>
            ))}
          </Flex>

          {/* Social sharing */}
          <ShareButtons url={url} title={title} position="relative" marginTop={0} />
        </Flex>
      </Flex>
    </Box>
  )
}

export default ProjectPageHero
