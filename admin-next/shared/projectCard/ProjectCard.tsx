import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import type { ProjectCardshared_project$key } from '@relay/ProjectCardshared_project.graphql'
import DefaultProjectImage from './DefaultProjectImage'
import { formatInfo, formatCounter, renderTag } from './ProjectCard.utils'
import { Box, BoxProps, Flex, Heading, Card, CapUIIcon, useTheme } from '@cap-collectif/ui'
import htmlDecode from '@shared/utils/htmlDecode'
import useIsMobile from '@shared/hooks/useIsMobile'
import Image from '@ui/Image/Image'
import { pxToRem } from '@shared/utils/pxToRem'

type Props = BoxProps & {
  readonly project: ProjectCardshared_project$key
  readonly isProjectsPage?: boolean
  readonly variantSize?: 'L' | 'M'
}

const FRAGMENT = graphql`
  fragment ProjectCardshared_project on Project {
    id
    title
    type {
      title
      color
    }
    themes {
      title
    }
    cover {
      url
    }
    isExternal
    externalLink
    url
    isVotesCounterDisplayable
    isContributionsCounterDisplayable
    isParticipantsCounterDisplayable
    archived
    votes {
      totalCount
    }
    paperVotesTotalCount
    anonymousVotes: votes(anonymous: true) {
      totalCount
    }
    contributions {
      totalCount
    }
    contributors {
      totalCount
    }
    anonymousReplies: contributions(type: REPLY_ANONYMOUS) {
      totalCount
    }
    hasParticipativeStep
    externalParticipantsCount
    externalContributionsCount
    externalVotesCount
    districts {
      totalCount
      edges {
        node {
          name
        }
      }
    }
    visibility
    publishedAt
    steps {
      state
      __typename
    }
    currentStep {
      id
      timeless
      state
      timeRange {
        endAt
      }
    }
  }
`

export const ProjectCard = ({
  project: projectKey,
  isProjectsPage,
  gridArea,
  width,
  height,
  p,
  px,
  py,
  variantSize,
  ...props
}: Props) => {
  const intl = useIntl()
  const isMobile = useIsMobile()
  const { colors } = useTheme()
  const project = useFragment(FRAGMENT, projectKey)

  const showCounters = project.hasParticipativeStep || project.isExternal
  const numericVotesTotalCount = project.votes?.totalCount ?? 0
  const votesTotalCount = project.isExternal
    ? project.externalVotesCount || 0
    : numericVotesTotalCount + project.paperVotesTotalCount || 0

  return (
    <Box
      className="project-card"
      as="a"
      href={project.externalLink || project.url}
      display="grid"
      gridArea={gridArea}
      width={width || '100%'}
      height={height || '100%'}
      p={p}
      px={px}
      py={py}
      css={{
        '&:hover': {
          textDecoration: 'none',
        },
      }}
    >
      <Card
        bg="white"
        p={0}
        flexDirection={variantSize === 'L' ? 'row' : 'column'}
        overflow="hidden"
        display="flex"
        border="unset"
        boxShadow="small"
        position="relative"
        {...props}
      >
        {project.cover?.url ? (
          <Image
            alt=""
            overflow="hidden"
            src={project.cover?.url}
            css={{
              objectFit: 'cover',
              objectPosition: 'left top',
              aspectRatio: '3 / 2',
              filter: project.archived ? 'grayscale(1)' : null,
              opacity: project.archived ? '50%' : null,
            }}
            position="relative"
            width={variantSize === 'L' ? '50%' : '100%'}
            sizes="(max-width: 320px) 320px,
        (max-width: 640px) 640px,
        (max-width: 960px) 960px,
        (max-width: 1280px) 960px,
        (max-width: 2560px) 960px,"
          />
        ) : (
          <Box
            overflow="hidden"
            css={{
              background: colors.primary[600],
              backgroundSize: 'cover',
              filter: project.archived ? 'grayscale(1)' : null,
              opacity: project.archived ? '50%' : null,
            }}
            position="relative"
            width={variantSize === 'L' ? '50%' : '100%'}
            pt={variantSize === 'L' ? pxToRem(300) : variantSize === 'M' ? '33.33%' : '66.66%'} // 3:2 aspect ratio trick
          >
            {!project.cover?.url && <DefaultProjectImage />}
          </Box>
        )}

        {renderTag(project, intl)}
        <Flex direction="column" m={4} bg="white" flex={1} overflow="hidden">
          <Heading
            truncate={100}
            as="h4"
            fontWeight="semibold"
            mb={4}
            color={project.archived ? 'gray.500' : 'gray.900'}
            lineHeight="base"
          >
            {htmlDecode(project.title)}
          </Heading>
          <Flex direction="column" justifyContent="space-between" height="100%">
            {(isProjectsPage || !isMobile) && (
              <Flex direction="row" flexWrap="wrap" color="neutral-gray.700">
                {project.type &&
                  formatInfo(
                    CapUIIcon.BookStarO,
                    intl.formatMessage({
                      id: project.type.title,
                    }),
                    project.archived,
                    project.type?.color,
                  )}{' '}
                {project.districts &&
                  project.districts?.totalCount > 0 &&
                  formatInfo(
                    CapUIIcon.PinO,
                    project.districts.edges?.map(district => district?.node?.name).join(' • ') || null,
                    project.archived,
                  )}
                {project.themes &&
                  project.themes?.length > 0 &&
                  formatInfo(
                    CapUIIcon.FolderO,
                    project.themes?.map(({ title }) => title).join(', ') || '',
                    project.archived,
                    null,
                  )}
              </Flex>
            )}
            {showCounters && (
              <Flex direction="row" spacing={8} mt={4}>
                {((project.isVotesCounterDisplayable || project.isExternal) &&
                  votesTotalCount &&
                  formatCounter(
                    CapUIIcon.ThumbUpO,
                    votesTotalCount,
                    project.archived,
                    intl.formatMessage({ id: 'project.votes.widget.votes' }),
                  )) ||
                  null}
                {((project.isContributionsCounterDisplayable ||
                  (project.isExternal && project.externalContributionsCount)) &&
                  formatCounter(
                    CapUIIcon.BubbleO,
                    project.isExternal ? project.externalContributionsCount || 0 : project.contributions.totalCount,
                    project.archived,
                    intl.formatMessage({ id: 'global.contribution' }),
                  )) ||
                  null}
                {((project.isParticipantsCounterDisplayable ||
                  (project.isExternal && project.externalParticipantsCount)) &&
                  formatCounter(
                    CapUIIcon.UserO,
                    project.isExternal
                      ? project.externalParticipantsCount || 0
                      : project.contributors.totalCount +
                          project.anonymousVotes.totalCount +
                          project.anonymousReplies?.totalCount,
                    project.archived,
                    intl.formatMessage({ id: 'capco.section.metrics.participants' }),
                  )) ||
                  null}
              </Flex>
            )}
          </Flex>
        </Flex>
      </Card>
    </Box>
  )
}

ProjectCard.displayName = 'ProjectCard'

export default ProjectCard
