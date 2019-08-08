// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import type { ConsultationStepHeader_step } from '~relay/ConsultationStepHeader_step.graphql';
import DatesInterval from '../Utils/DatesInterval';
import RemainingTime from '../Utils/RemainingTime';
import StepInfos from '../Steps/Page/StepInfos';

type RelayProps = {|
  +step: ConsultationStepHeader_step
|}

type Props = {|
  ...RelayProps,
|}

const ConsultationStepHeader = ({ step }: Props) => {
  const { timeRange: { startAt, endAt }} = step;
  return (
    <React.Fragment>
      <div className="row mb-30 text-center">
        <div className="mr-15 d-ib">
          <i className="cap cap-calendar-2-1" />{' '}
          <DatesInterval startAt={startAt} endAt={endAt} fullDay/>
        </div>
        {step.timeRange.endAt && step.status === 'OPENED' && !step.timeless && (
          <div className="mr-15 d-ib">
            <i className="cap cap-hourglass-1" /> <RemainingTime endAt={step.timeRange.endAt} />
          </div>
        )}
      </div>
      {/* $FlowFixMe $refType */}
      <StepInfos maxLength={600} step={step} />
    </React.Fragment>
  )
}

export default createFragmentContainer(ConsultationStepHeader, {
  step: graphql`
      fragment ConsultationStepHeader_step on ConsultationStep {
          status
          timeless
          timeRange {
              startAt
              endAt
          }
          body
          ...StepInfos_step
      }
  `,
});
