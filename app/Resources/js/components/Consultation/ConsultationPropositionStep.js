// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import ConsultationPlan from './ConsultationPlan';
import DatesInterval from '../Utils/DatesInterval';
import RemainingTime from '../Utils/RemainingTime';
import StepInfos from '../Steps/Page/StepInfos';
import SectionRecursiveList from './SectionRecursiveList';
import type { ConsultationPropositionStep_consultationStep } from '~relay/ConsultationPropositionStep_consultationStep.graphql';

type RelayProps = {|
  +consultationStep: ConsultationPropositionStep_consultationStep,
|};

type Props = {|
  ...RelayProps,
  +consultationPlanEnabled: boolean,
  +showConsultationPlan: boolean,
|};

export const ConsultationPropositionStep = (props: Props) => {
  const { consultationPlanEnabled, showConsultationPlan, consultationStep: step } = props;

  return (
    <React.Fragment>
      {consultationPlanEnabled && (
        <div
          className={
            showConsultationPlan
              ? 'consultation-plan sticky col-md-3 col-sm-12'
              : 'consultation-plan sticky'
          }
          id="consultation-plan">
          {step.consultations.edges && step.consultations.edges.length > 0 && (
            <ConsultationPlan
              consultation={step.consultations.edges[0] && step.consultations.edges[0].node}
            />
          )}
        </div>
      )}
      <div
        id="scroll-content"
        className={
          consultationPlanEnabled && showConsultationPlan ? 'col-md-9' : 'col-md-10 col-md-offset-1'
        }>
        <h2 className="text-center">{step.title}</h2>
        <div className="mb-30 project__step-dates text-center">
          {(step.timeRange.startAt || step.timeRange.endAt) && (
            <div className="mr-15 d-ib">
              <i className="cap cap-calendar-2-1" />{' '}
              <DatesInterval
                startAt={step.timeRange.startAt}
                endAt={step.timeRange.endAt}
                fullDay
              />
            </div>
          )}
          {step.timeRange.endAt && step.status === 'OPENED' && !step.timeless && (
            <div className="mr-15 d-ib">
              <i className="cap cap-hourglass-1" /> <RemainingTime endAt={step.timeRange.endAt} />
            </div>
          )}
        </div>
        {/* $FlowFixMe $refType */}
        <StepInfos step={step} />
        {/* $FlowFixMe */}
        {step.consultations.edges && step.consultations.edges.length > 0 && (
          <SectionRecursiveList
            consultation={step.consultations.edges[0] && step.consultations.edges[0].node}
          />
        )}
      </div>
    </React.Fragment>
  );
};

export default createFragmentContainer(ConsultationPropositionStep, {
  consultationStep: graphql`
    fragment ConsultationPropositionStep_consultationStep on ConsultationStep {
      ...StepInfos_step
      id
      timeRange {
        startAt
        endAt
      }
      title
      status
      timeless
      consultations(first: 1) {
        edges {
          node {
            ...ConsultationPlan_consultation
            ...SectionRecursiveList_consultation @arguments(isAuthenticated: $isAuthenticated)
          }
        }
      }
    }
  `,
});
