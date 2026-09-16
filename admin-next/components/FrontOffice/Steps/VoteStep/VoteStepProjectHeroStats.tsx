'use client'

import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import moment from 'moment'
import { Box, CapUIFontSize, CapUILineHeight, Heading, Text, Tooltip } from '@cap-collectif/ui'
import { VoteStepProjectHeroStats_project$key } from '@relay/VoteStepProjectHeroStats_project.graphql'
import { formatBigNumber } from '@utils/format-number'

type Props = {
  project: VoteStepProjectHeroStats_project$key
}

const FRAGMENT = graphql`
  fragment VoteStepProjectHeroStats_project on Project {
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
    votes {
      totalCount
    }
    paperVotesTotalCount
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
  }
`

const VoteStepProjectHeroStats: React.FC<Props> = ({ project: projectKey }) => {
  const intl = useIntl()
  const project = useFragment(FRAGMENT, projectKey)

  const numericVotesTotalCount = project.votes?.totalCount ?? 0
  const votesTotalCount = numericVotesTotalCount + project.paperVotesTotalCount
  const contributionsTotalCount = project.contributions.totalCount
  const participantsTotalCount = project.contributors.totalCount

  const getDaysLeftBlock = () => {
    if (project.steps.length !== 1 || project.steps[0].state !== 'OPENED' || !project.steps[0].timeRange?.endAt) {
      return null
    }

    const count = moment(project.steps[0].timeRange.endAt).diff(moment(), 'days')
    const tooltipLabel =
      project.steps[0].timeRange?.startAt && project.steps[0].timeRange?.endAt
        ? intl.formatMessage(
            { id: 'fromDayToDay' },
            {
              day: intl.formatDate(moment(project.steps[0].timeRange.startAt) as unknown as string, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
              }),
              anotherDay: intl.formatDate(moment(project.steps[0].timeRange.endAt) as unknown as string, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
              }),
            },
          )
        : null

    return renderBlock('', count, intl.formatMessage({ id: 'count.daysLeft' }, { count }), tooltipLabel)
  }

  const getContributionsTooltip = () => {
    const proposalsTotalCount = project.proposals.totalCount
    const opinionsTotalCount = project.opinions.totalCount
    const opinionVersionsTotalCount = project.opinionVersions.totalCount
    const sourcesTotalCount = project.sources.totalCount
    const repliesTotalCount = project.replies.totalCount
    const argumentsTotalCount =
      project.argument.totalCount + project.debateArgument.totalCount + project.debateAnonymousArgument.totalCount

    if (
      proposalsTotalCount === 0 &&
      opinionsTotalCount === 0 &&
      opinionVersionsTotalCount === 0 &&
      sourcesTotalCount === 0 &&
      repliesTotalCount === 0 &&
      argumentsTotalCount === 0
    ) {
      return null
    }

    return (
      <Box padding={1} textAlign="center">
        {opinionsTotalCount > 0 || proposalsTotalCount > 0 ? (
          <Text marginBottom="0px !important">
            {intl.formatMessage(
              { id: project.firstCollectStep?.form?.objectType === 'OPINION' ? 'opinion.count' : 'proposal-count' },
              { count: opinionsTotalCount + proposalsTotalCount },
            )}
          </Text>
        ) : null}
        {opinionVersionsTotalCount > 0 ? (
          <Text marginBottom="0px !important">
            {intl.formatMessage({ id: 'amendment-count' }, { count: opinionVersionsTotalCount })}
          </Text>
        ) : null}
        {argumentsTotalCount > 0 ? (
          <Text marginBottom="0px !important">
            {intl.formatMessage({ id: 'argument-count' }, { count: argumentsTotalCount })}
          </Text>
        ) : null}
        {sourcesTotalCount > 0 ? (
          <Text marginBottom="0px !important">
            {intl.formatMessage({ id: 'source-count' }, { count: sourcesTotalCount })}
          </Text>
        ) : null}
        {repliesTotalCount > 0 ? (
          <Text marginBottom="0px !important">
            {intl.formatMessage({ id: 'answer-count' }, { count: repliesTotalCount })}
          </Text>
        ) : null}
      </Box>
    )
  }

  const getVotesTooltip = () => (
    <Box padding={1} textAlign="center">
      {numericVotesTotalCount > 0 ? (
        <Text marginBottom="0px !important">
          {intl.formatMessage({ id: 'numeric-votes-count' }, { num: numericVotesTotalCount })}
        </Text>
      ) : null}
      {project.paperVotesTotalCount > 0 ? (
        <Text marginBottom="0px !important">
          {intl.formatMessage({ id: 'paper-votes-count' }, { num: project.paperVotesTotalCount })}
        </Text>
      ) : null}
    </Box>
  )

  const getParticipantsTooltip = () => (
    <Box padding={1} textAlign="center">
      <Text marginBottom="0px !important">
        {intl.formatMessage({ id: 'online-contributors' }, { count: participantsTotalCount })}
      </Text>
    </Box>
  )

  const renderBlock = (contentId: string, content: number, title: string, tooltipLabel?: React.ReactNode) => {
    const block = (
      <Box
        className="projectHeader__block"
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="start"
        marginRight={[6, 8]}
        marginBottom={[2, 0]}
        maxHeight={10}
        as={tooltipLabel ? 'button' : 'li'}
        border="none"
        backgroundColor="transparent"
        p={0}
        sx={{ listStyle: 'none', cursor: tooltipLabel ? 'pointer' : 'default' }}
      >
        <Heading
          className="projectHeader__block__content platform__body"
          id={contentId}
          fontSize={[CapUIFontSize.BodySmall, CapUIFontSize.Headline]}
          lineHeight={CapUILineHeight.M}
          fontWeight="semibold"
          height={[4, 6]}
          color="neutral-gray.900"
        >
          {formatBigNumber(content)}
        </Heading>
        <Text
          className="projectHeader__block__title platform__body"
          color="neutral-gray.900"
          fontSize={[CapUIFontSize.Caption, CapUIFontSize.Headline]}
          lineHeight={CapUILineHeight.M}
          fontWeight="normal"
          height={[4, 6]}
        >
          {title.charAt(0).toUpperCase() + title.slice(1)}
        </Text>
      </Box>
    )

    if (!tooltipLabel) return block

    return (
      <Box as="li" sx={{ listStyle: 'none' }}>
        <Tooltip label={tooltipLabel} zIndex={10}>
          {block}
        </Tooltip>
      </Box>
    )
  }

  return (
    <Box
      className="projectHeader__blocks"
      display="flex"
      flexDirection="row"
      flexWrap="wrap"
      width="100%"
      flexBasis="100%"
      alignItems="flex-end"
      marginTop={[4, 6]}
      height={10}
      maxHeight={10}
      justifyContent="flex-start"
      p={0}
      as="ul"
    >
      {getDaysLeftBlock()}
      {project.isContributionsCounterDisplayable
        ? renderBlock(
            'contributions-count',
            contributionsTotalCount,
            intl.formatMessage({ id: 'contribution-plural' }, { num: contributionsTotalCount }),
            getContributionsTooltip(),
          )
        : null}
      {project.isVotesCounterDisplayable && votesTotalCount > 0
        ? renderBlock(
            'votes-counter-pill',
            votesTotalCount,
            intl.formatMessage({ id: 'vote-plural' }, { num: votesTotalCount }),
            getVotesTooltip(),
          )
        : null}
      {project.isParticipantsCounterDisplayable
        ? renderBlock(
            'contributors-count',
            participantsTotalCount,
            intl.formatMessage({ id: 'project.preview.counters.contributors' }, { num: participantsTotalCount }),
            getParticipantsTooltip(),
          )
        : null}
    </Box>
  )
}

export default VoteStepProjectHeroStats
