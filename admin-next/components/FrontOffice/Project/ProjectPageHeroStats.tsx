'use client'

import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import { Flex, Tag, CapUIIcon } from '@cap-collectif/ui'
import { ProjectPageHeroStats_project$key } from '@relay/ProjectPageHeroStats_project.graphql'
import { formatNumber } from '@shared/utils/FormattedNumber'

const FRAGMENT = graphql`
  fragment ProjectPageHeroStats_project on Project {
    isVotesCounterDisplayable
    isContributionsCounterDisplayable
    isParticipantsCounterDisplayable
    votes {
      totalCount
    }
    paperVotesTotalCount
    contributions {
      totalCount
    }
    contributors {
      totalCount
    }
    anonymousVotes: votes(anonymous: true) {
      totalCount
    }
    repliesAnonymous: contributions(type: REPLY_ANONYMOUS) {
      totalCount
    }
  }
`

type Props = {
  project: ProjectPageHeroStats_project$key
}

const ProjectPageHeroStats: React.FC<Props> = ({ project: projectKey }) => {
  const intl = useIntl()
  const project = useFragment(FRAGMENT, projectKey)

  const {
    isVotesCounterDisplayable,
    isContributionsCounterDisplayable,
    isParticipantsCounterDisplayable,
    votes,
    paperVotesTotalCount,
    contributions,
    contributors,
    anonymousVotes,
    repliesAnonymous,
  } = project

  const votesTotalCount = (votes?.totalCount ?? 0) + paperVotesTotalCount
  const participantsTotalCount =
    contributors.totalCount + (anonymousVotes?.totalCount ?? 0) + (repliesAnonymous?.totalCount ?? 0)

  return (
    <Flex wrap="wrap" gap="md">
      {isVotesCounterDisplayable && votesTotalCount > 0 && (
        <Tag transparent variantColor="infoGray" px={0}>
          <Tag.LeftIcon name={CapUIIcon.ThumbUpO} />
          <Tag.Label>
            {`${formatNumber(votesTotalCount)} ${intl.formatMessage(
              { id: 'project.preview.counters.votes' },
              { num: votesTotalCount },
            )}`}
          </Tag.Label>
        </Tag>
      )}
      {isContributionsCounterDisplayable && (
        <Tag transparent variantColor="infoGray" px={0}>
          <Tag.LeftIcon name={CapUIIcon.BubbleO} />
          <Tag.Label>
            {`${formatNumber(contributions.totalCount)} ${intl.formatMessage(
              { id: 'project.preview.counters.contributions' },
              { num: contributions.totalCount },
            )}`}
          </Tag.Label>
        </Tag>
      )}
      {isParticipantsCounterDisplayable && (
        <Tag transparent variantColor="infoGray" px={0}>
          <Tag.LeftIcon name={CapUIIcon.UserO} />
          <Tag.Label>
            {`${formatNumber(participantsTotalCount)} ${intl.formatMessage(
              { id: 'project.preview.counters.contributors' },
              { num: participantsTotalCount },
            )}`}
          </Tag.Label>
        </Tag>
      )}
    </Flex>
  )
}

export default ProjectPageHeroStats
