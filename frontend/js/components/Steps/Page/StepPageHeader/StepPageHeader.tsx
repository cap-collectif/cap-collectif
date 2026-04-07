import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import RemainingTime from '~/components/Utils/RemainingTime'
import DatesInterval from '~/components/Utils/DatesInterval'
import type { StepPageHeader_step$key } from '~relay/StepPageHeader_step.graphql'
import BodyInfos from '~/components/Ui/Boxes/BodyInfos'
import { isInterpellationContextFromStep, isOpinionFormStep } from '~/utils/interpellationLabelHelper'
import StepPageHeaderContainer from './StepPageHeader.style'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import StepPageHeaderNew from './StepPageHeaderNew'

type Props = {
  step: StepPageHeader_step$key
}
const FRAGMENT = graphql`
  fragment StepPageHeader_step on Step {
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
      allProposals: proposals(first: 0) {
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
      allProposals: proposals(first: 0) {
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
    const votesCount = step.__typename === 'ConsultationStep' ? (step.votes?.totalCount ?? null) : null
    const contributionsCount =
      step.__typename === 'ConsultationStep'
        ? (step.contributions?.totalCount ?? null)
        : step.__typename === 'CollectStep' || step.__typename === 'SelectionStep'
        ? (step.allProposals?.totalCount ?? null)
        : null
    const participantsCount =
      step.__typename === 'ConsultationStep' ||
      step.__typename === 'CollectStep' ||
      step.__typename === 'SelectionStep' ||
      step.__typename === 'QuestionnaireStep' ||
      step.__typename === 'DebateStep'
        ? (step.contributors?.totalCount ?? null)
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
        eventsCount={step.eventsFuture?.totalCount ?? 0}
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
