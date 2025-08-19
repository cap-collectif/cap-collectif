import * as React from 'react'
import { FormatDateOptions, useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'
import moment from 'moment'
import { Box, Flex } from '@cap-collectif/ui'
import Stat from './Stat'
import { ProjectHeaderStatsQuery } from '@relay/ProjectHeaderStatsQuery.graphql'

const QUERY = graphql`
  query ProjectHeaderStatsQuery($projectSlug: String!) {
    project: nodeSlug(entity: PROJECT, slug: $projectSlug) {
      ... on Project {
        isVotesCounterDisplayable
        isContributionsCounterDisplayable
        isParticipantsCounterDisplayable
        firstCollectStep {
          form {
            objectType
          }
        }
        steps {
          state
          timeRange {
            startAt
            endAt
          }
        }
        contributions {
          totalCount
        }
        opinions: contributions(type: OPINION) {
          totalCount
        }
        opinionVersions: contributions(type: OPINIONVERSION) {
          totalCount
        }
        sources: contributions(type: SOURCE) {
          totalCount
        }
        replies: contributions(type: REPLY) {
          totalCount
        }
        repliesAnonymous: contributions(type: REPLY_ANONYMOUS) {
          totalCount
        }
        argument: contributions(type: ARGUMENT) {
          totalCount
        }
        debateArgument: contributions(type: DEBATEARGUMENT) {
          totalCount
        }
        debateAnonymousArgument: contributions(type: DEBATEANONYMOUSARGUMENT) {
          totalCount
        }
        proposals: contributions(type: PROPOSAL) {
          totalCount
        }
        contributors {
          totalCount
        }
        votes {
          totalCount
        }
        anonymousVotes: votes(anonymous: true) {
          totalCount
        }
        paperVotesTotalCount
      }
    }
  }
`

export type Props = {
  projectSlug: string
}

const ProjectHeaderStats: React.FC<Props> = ({ projectSlug }) => {
  const intl = useIntl()
  const { project } = useLazyLoadQuery<ProjectHeaderStatsQuery>(QUERY, { projectSlug })
  const {
    firstCollectStep,
    steps,
    opinions,
    opinionVersions,
    sources,
    replies,
    repliesAnonymous,
    argument,
    debateArgument,
    debateAnonymousArgument,
    proposals,
    votes,
    anonymousVotes,
    paperVotesTotalCount,
    contributions,
    contributors,
    isContributionsCounterDisplayable,
    isVotesCounterDisplayable,
    isParticipantsCounterDisplayable,
  } = project
  const numericVotesTotalCount = votes?.totalCount ?? 0
  const votesTotalCount = numericVotesTotalCount + paperVotesTotalCount
  const participantsTotalCount = contributors.totalCount + anonymousVotes.totalCount + repliesAnonymous.totalCount

  const getDaysLeftBlock = () => {
    if (steps.length === 1 && steps[0].state === 'OPENED' && steps[0].timeRange?.endAt) {
      const count = moment(steps[0].timeRange?.endAt).diff(moment(), 'days')

      const format: FormatDateOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }

      return (
        <Stat
          entity={intl.formatMessage(
            {
              id: 'count.daysLeft',
            },
            {
              count,
            },
          )}
          count={count}
          tooltipLabel={
            steps[0].timeRange?.startAt && steps[0].timeRange?.endAt
              ? intl.formatMessage(
                  {
                    id: 'fromDayToDay',
                  },
                  {
                    day: intl.formatDate(moment(steps[0].timeRange?.startAt) as unknown as string, format),
                    anotherDay: intl.formatDate(moment(steps[0].timeRange?.endAt) as unknown as string, format),
                  },
                )
              : null
          }
        />
      )
    }

    return null
  }

  const getVotesTooltip = () => (
    <Box padding={1} textAlign="center">
      {numericVotesTotalCount > 0 && (
        <Box>
          {intl.formatMessage(
            {
              id: 'numeric-votes-count',
            },
            {
              num: numericVotesTotalCount,
            },
          )}
        </Box>
      )}
      {paperVotesTotalCount > 0 && (
        <Box>
          {intl.formatMessage(
            {
              id: 'paper-votes-count',
            },
            {
              num: paperVotesTotalCount,
            },
          )}
        </Box>
      )}
    </Box>
  )

  const getParticipantsTooltip = () => (
    <Box padding={1} textAlign="center">
      <Box>
        {intl.formatMessage(
          {
            id: 'online-contributors',
          },
          {
            count: participantsTotalCount,
          },
        )}
      </Box>
    </Box>
  )

  const getContributionsTooltip = () => {
    if (
      opinions.totalCount > 0 ||
      proposals.totalCount > 0 ||
      opinionVersions.totalCount > 0 ||
      sources.totalCount > 0 ||
      replies.totalCount > 0 ||
      argument.totalCount > 0 ||
      debateAnonymousArgument.totalCount > 0 ||
      debateArgument.totalCount > 0
    ) {
      return (
        <Box padding={1} textAlign="center">
          {(opinions.totalCount > 0 || proposals.totalCount > 0) && (
            <Box>
              {intl.formatMessage(
                {
                  id: firstCollectStep?.form?.objectType === 'OPINION' ? 'opinion.count' : 'proposal-count',
                },
                {
                  count: opinions.totalCount + proposals.totalCount,
                },
              )}
            </Box>
          )}
          {opinionVersions.totalCount > 0 && (
            <Box>
              {intl.formatMessage(
                {
                  id: 'amendment-count',
                },
                {
                  count: opinionVersions.totalCount,
                },
              )}
            </Box>
          )}
          {(argument.totalCount > 0 || debateArgument.totalCount > 0 || debateAnonymousArgument.totalCount > 0) && (
            <Box>
              {intl.formatMessage(
                {
                  id: 'argument-count',
                },
                {
                  count: argument.totalCount + debateArgument.totalCount + debateAnonymousArgument.totalCount,
                },
              )}
            </Box>
          )}
          {sources.totalCount > 0 && (
            <Box>
              {intl.formatMessage(
                {
                  id: 'source-count',
                },
                {
                  count: sources.totalCount,
                },
              )}
            </Box>
          )}
          {replies.totalCount > 0 && (
            <Box>
              {intl.formatMessage(
                {
                  id: 'answer-count',
                },
                {
                  count: replies.totalCount,
                },
              )}
            </Box>
          )}
        </Box>
      )
    }
  }

  return (
    <Flex
      className="projectHeader__blocks"
      flexDirection="row"
      flexWrap="wrap"
      width="100%"
      flexBasis="100%"
      alignItems="flex-end"
      justifyContent="flex-start"
      gap={['md', 'lg']}
    >
      {getDaysLeftBlock()}
      {isContributionsCounterDisplayable && (
        <Stat
          tooltipLabel={getContributionsTooltip()}
          entity={intl.formatMessage(
            {
              id: 'contribution-plural',
            },
            {
              num: contributions.totalCount,
            },
          )}
          count={contributions.totalCount}
        />
      )}
      {votesTotalCount > 0 && isVotesCounterDisplayable && (
        <Stat
          tooltipLabel={getVotesTooltip()}
          entity={intl.formatMessage(
            {
              id: 'vote-plural',
            },
            {
              num: votesTotalCount,
            },
          )}
          count={votesTotalCount}
        />
      )}

      {isParticipantsCounterDisplayable && (
        <Stat
          tooltipLabel={getParticipantsTooltip()}
          entity={intl.formatMessage(
            {
              id: 'project.preview.counters.contributors',
            },
            {
              num: participantsTotalCount,
            },
          )}
          count={participantsTotalCount}
        />
      )}
    </Flex>
  )
}

export default ProjectHeaderStats
