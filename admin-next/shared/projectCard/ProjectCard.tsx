import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import type { ProjectCardshared_project$key } from '@relay/ProjectCardshared_project.graphql'
import { formatCounter, renderTag } from './ProjectCard.utils'
import {
  BoxProps,
  Card,
  CapUIIcon,
  CardCoverImage,
  CardCoverPlaceholder,
  CardCover,
  CardContent,
  CardTagList,
  CardProps,
} from '@cap-collectif/ui'
import htmlDecode from '@shared/utils/htmlDecode'
import { getSrcSet } from '@shared/ui/Image'

type Props = BoxProps & {
  project: ProjectCardshared_project$key
  format?: CardProps['format']
  primaryInfoTag?: React.ElementType
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
    status
    paperVotesTotalCount
    contributions {
      totalCount
    }
    contributors {
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

export const ProjectCard = ({ project: projectKey, primaryInfoTag, ...props }: Props) => {
  const intl = useIntl()
  const project = useFragment(FRAGMENT, projectKey)

  const { isExternal, externalParticipantsCount, archived, externalVotesCount, paperVotesTotalCount, id } = project

  const showCounters = project.hasParticipativeStep || isExternal
  const numericVotesTotalCount = project.votes?.totalCount ?? 0
  const votesTotalCount = isExternal ? externalVotesCount || 0 : numericVotesTotalCount + paperVotesTotalCount || 0

  return (
    <Card id={`cap-project-card-${id}`} className="cap-project-card" isArchived={archived} {...props}>
      <CardCover>
        {project.cover?.url ? (
          <CardCoverImage {...getSrcSet(project?.cover?.url)} />
        ) : (
          <CardCoverPlaceholder icon={CapUIIcon.FolderO} color="primary.base" />
        )}
        {renderTag(project, intl)}
      </CardCover>
      <CardContent
        primaryInfo={htmlDecode(project.title)}
        href={project.externalLink || project.url}
        primaryInfoTag={primaryInfoTag}
      >
        {showCounters ? (
          <CardTagList>
            {((project.isVotesCounterDisplayable || isExternal) &&
              votesTotalCount &&
              formatCounter(
                CapUIIcon.ThumbUpO,
                votesTotalCount,
                intl.formatMessage({ id: 'project.votes.widget.votes' }),
              )) ||
              null}
            {((project.isContributionsCounterDisplayable || (isExternal && project.externalContributionsCount)) &&
              formatCounter(
                CapUIIcon.BubbleO,
                isExternal ? project.externalContributionsCount || 0 : project.contributions.totalCount,
                intl.formatMessage({ id: 'global.contribution' }),
              )) ||
              null}
            {((project.isParticipantsCounterDisplayable || (isExternal && externalParticipantsCount)) &&
              formatCounter(
                CapUIIcon.UserO,
                isExternal
                  ? externalParticipantsCount || 0
                  : project.contributors.totalCount,
                intl.formatMessage({ id: 'capco.section.metrics.participants' }),
              )) ||
              null}
          </CardTagList>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default ProjectCard
