import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import RemainingTime from '~/components/Utils/RemainingTime'
import DatesInterval from '~/components/Utils/DatesInterval'
import type { StepPageHeader_step$key } from '~relay/StepPageHeader_step.graphql'
import '~relay/StepPageHeader_step.graphql'
import BodyInfos from '~/components/Ui/Boxes/BodyInfos'
import { isInterpellationContextFromStep, isOpinionFormStep } from '~/utils/interpellationLabelHelper'
import StepPageHeaderContainer from './StepPageHeader.style'

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
    ... on SelectionStep {
      voteThreshold
      votable
      canDisplayBallot
      ...interpellationLabelHelper_step @relay(mask: false)
    }
  }
`
export const StepPageHeader = ({ step: stepFragment }: Props) => {
  const step = useFragment(FRAGMENT, stepFragment)

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
