import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import RemainingTime from '~/components/Utils/RemainingTime'
import DatesInterval from '~/components/Utils/DatesInterval'
import type { StepPageHeader_step$data, StepPageHeader_step$key } from '~relay/StepPageHeader_step.graphql'

type _Project = NonNullable<StepPageHeader_step$data['project']>

export type VotesTooltipData = {
  numeric: _Project['votes']['totalCount']
  paper: _Project['paperVotesTotalCount']
}

export type ContributionsTooltipData = {
  opinions: _Project['opinions']['totalCount']
  opinionVersions: _Project['opinionVersions']['totalCount']
  arguments: _Project['argument']['totalCount']
  sources: _Project['sources']['totalCount']
  replies: _Project['replies']['totalCount']
}
import BodyInfos from '~/components/Ui/Boxes/BodyInfos'
import { isInterpellationContextFromStep, isOpinionFormStep } from '~/utils/interpellationLabelHelper'
import StepPageHeaderContainer from './StepPageHeader.style'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import StepPageHeaderNew from './StepPageHeaderNew'

type Props = {
  step: StepPageHeader_step$key
}
const FRAGMENT = graphql`
  fragment StepPageHeader_step on Step @argumentDefinitions(token: { type: "String" }) {
    __typename
    body
    state
    title
    timeless
    timeRange {
      startAt
      endAt
    }
    project {
      slug
      cover {
        url
      }
      votes {
        totalCount
      }
      paperVotesTotalCount
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
    }
    eventsFuture: events(orderBy: { field: START_AT, direction: DESC }, isFuture: true) {
      totalCount
    }
    ... on ConsultationStep {
      votes {
        totalCount
      }
      contributions {
        totalCount
      }
      contributors {
        totalCount
      }
    }
    ... on CollectStep {
      allProposals: proposals(first: 0, participantToken: $token) {
        totalCount
      }
      contributors {
        totalCount
      }
    }
    ... on SelectionStep {
      votable
      voteThreshold
      canDisplayBallot
      allProposals: proposals(first: 0, participantToken: $token) {
        totalCount
      }
      contributors {
        totalCount
      }
      ...interpellationLabelHelper_step @relay(mask: false)
    }
    ... on QuestionnaireStep {
      contributors {
        totalCount
      }
      questionnaire {
        multipleRepliesAllowed
        replies {
          totalCount
        }
      }
    }
    ... on DebateStep {
      contributors {
        totalCount
      }
    }
  }
`
export const StepPageHeader = ({ step: stepFragment }: Props) => {
  const step = useFragment(FRAGMENT, stepFragment)
  const new_page_project = useFeatureFlag('new_project_page')

  if (new_page_project) {
    const isSelectionStepVotable =
      step.__typename === 'SelectionStep' && step.votable === true && step.canDisplayBallot === true

    // Votes: ConsultationStep uses step-level votes; SelectionStep (votable) uses project-level votes
    const numericVotesCount =
      step.__typename === 'ConsultationStep'
        ? step.votes?.totalCount ?? 0
        : isSelectionStepVotable
        ? step.project?.votes?.totalCount ?? 0
        : 0
    const paperVotesCount = isSelectionStepVotable ? step.project?.paperVotesTotalCount ?? 0 : 0
    const votesCount =
      step.__typename === 'ConsultationStep'
        ? step.votes?.totalCount ?? null
        : isSelectionStepVotable
        ? numericVotesCount + paperVotesCount
        : null

    // Contributions: ConsultationStep total contributions; CollectStep/SelectionStep (non-votable) proposals
    const contributionsCount =
      step.__typename === 'ConsultationStep'
        ? step.contributions?.totalCount ?? null
        : step.__typename === 'CollectStep' || (step.__typename === 'SelectionStep' && !isSelectionStepVotable)
        ? step.allProposals?.totalCount ?? null
        : null

    const participantsCount =
      step.__typename === 'ConsultationStep' ||
      step.__typename === 'CollectStep' ||
      step.__typename === 'SelectionStep' ||
      step.__typename === 'QuestionnaireStep' ||
      step.__typename === 'DebateStep'
        ? step.contributors?.totalCount ?? null
        : null

    // Replies: QuestionnaireStep only, when multipleRepliesAllowed
    const repliesCount =
      step.__typename === 'QuestionnaireStep' && step.questionnaire?.multipleRepliesAllowed
        ? step.questionnaire.replies?.totalCount ?? null
        : null

    // Tooltip for ConsultationStep contributions breakdown (project-level per type)
    const { project } = step
    const contributionsTooltipData =
      step.__typename === 'ConsultationStep' && project
        ? {
            opinions: (project.opinions?.totalCount ?? 0) + (project.proposals?.totalCount ?? 0),
            opinionVersions: project.opinionVersions?.totalCount ?? 0,
            arguments:
              (project.argument?.totalCount ?? 0) +
              (project.debateArgument?.totalCount ?? 0) +
              (project.debateAnonymousArgument?.totalCount ?? 0),
            sources: project.sources?.totalCount ?? 0,
            replies: project.replies?.totalCount ?? 0,
          }
        : null

    // Tooltip for SelectionStep votes breakdown (numeric vs paper)
    const votesTooltipData =
      isSelectionStepVotable && (numericVotesCount > 0 || paperVotesCount > 0)
        ? { numeric: numericVotesCount, paper: paperVotesCount }
        : null

    return (
      <StepPageHeaderNew
        title={step.title}
        body={step.body}
        state={step.state}
        timeless={step.timeless}
        timeRange={step.timeRange}
        projectUrl={step.project?.slug ? `/test-project/${step.project.slug}` : undefined}
        coverUrl={step.project?.cover?.url}
        votesCount={votesCount}
        contributionsCount={contributionsCount}
        participantsCount={participantsCount}
        repliesCount={repliesCount}
        eventsCount={step.eventsFuture?.totalCount ?? 0}
        contributionsTooltipData={contributionsTooltipData}
        votesTooltipData={votesTooltipData}
      />
    )
  }

  const stepIsParticipative = () => {
    return (
      step &&
      (step.__typename === 'ConsultationStep' ||
        step.__typename === 'CollectStep' ||
        step.__typename === 'QuestionnaireStep' ||
        (step.__typename === 'SelectionStep' && step.votable === true))
    )
  }

  return (
    <StepPageHeaderContainer>
      <h2 className="h2">{step.title}</h2>
      <div className="mb-30 project__step-dates">
        {(step.timeRange.startAt || step.timeRange.endAt) && (
          <div className="mr-15 d-ib">
            <i className="cap cap-calendar-2-1" />{' '}
            <DatesInterval startAt={step.timeRange.startAt} endAt={step.timeRange.endAt} fullDay />
          </div>
        )}
        {step.timeRange.endAt && step.state === 'OPENED' && !step.timeless && stepIsParticipative() && (
          <div className="mr-15 d-ib hidden-print">
            <i className="cap cap-hourglass-1" /> <RemainingTime endAt={step.timeRange.endAt} />
          </div>
        )}
      </div>
      {step.__typename === 'SelectionStep' && step.voteThreshold && step.canDisplayBallot ? (
        <h4
          style={{
            marginBottom: '20px',
          }}
        >
          <i
            className="cap cap-hand-like-2-1"
            style={{
              fontSize: '22px',
              color: '#377bb5',
            }}
          />{' '}
          <FormattedMessage
            id={
              isInterpellationContextFromStep(step)
                ? 'interpellation.support.threshold.step'
                : isOpinionFormStep(step)
                ? 'opinion.vote.threshold.step'
                : 'proposal.vote.threshold.step'
            }
            values={{
              num: step.voteThreshold,
            }}
          />
        </h4>
      ) : null}
      {step.body && <BodyInfos maxLines={5} body={step.body} />}
    </StepPageHeaderContainer>
  )
}
export default StepPageHeader
