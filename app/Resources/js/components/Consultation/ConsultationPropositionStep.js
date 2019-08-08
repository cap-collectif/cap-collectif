// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import styled, { css } from 'styled-components';
import ConsultationPlan from './ConsultationPlan';
import DatesInterval from '../Utils/DatesInterval';
import RemainingTime from '../Utils/RemainingTime';
import StepInfos from '../Steps/Page/StepInfos';
import SectionRecursiveList from './SectionRecursiveList';
import type { ConsultationPropositionStep_consultationStep } from '~relay/ConsultationPropositionStep_consultationStep.graphql';
import { STEP_PROPOSITION_NAVIGATION_HEIGHT } from '../Steps/StepPropositionNavigationBox';
import { breakpoint } from '../../utils/mixins';

type RelayProps = {|
  +consultationStep: ConsultationPropositionStep_consultationStep,
|};

type Props = {|
  ...RelayProps,
  +consultationPlanEnabled: boolean,
  +showConsultationPlan: boolean,
|};

const STICKY_OFFSET_TOP = 60;

const ConsultationPlanInner = styled.div`
  top: inherit;
  ${breakpoint('large', css`
    top: ${({ offset }) => `${offset}px`}
  `)}
`;

export const ConsultationPropositionStep = (props: Props) => {
  const { consultationPlanEnabled, showConsultationPlan, consultationStep: step } = props;
  const stepNavigationHeaderRef = React.useRef<?HTMLDivElement>(null);
  const getStepNavigationHeader: ?HTMLDivElement = () => {
    if (stepNavigationHeaderRef.current === null) {
      stepNavigationHeaderRef.current = document.querySelector('.step__propositions__navigation');
    }
    return stepNavigationHeaderRef.current;
  };
  const stickyOffset = getStepNavigationHeader() ?
    STEP_PROPOSITION_NAVIGATION_HEIGHT : 0;

  const atLeast2Sections = () => {
    return (
      step.consultations.edges &&
      step.consultations.edges[0] &&
      step.consultations.edges[0].node.sections &&
      step.consultations.edges[0].node.sections.length > 1
    );
  };

  return (
    <>
      {consultationPlanEnabled && (
        <ConsultationPlanInner
          className={
            showConsultationPlan
              ? 'consultation-plan sticky col-md-3 col-sm-12'
              : 'consultation-plan sticky'
          }
          offset={STICKY_OFFSET_TOP + stickyOffset}
          id="consultation-plan">
          {step.consultation && (
            <ConsultationPlan
              consultation={step.consultation}
            />
          )}
        </ConsultationPlanInner>
      )}
      <div
        id="scroll-content"
        className={
          consultationPlanEnabled && showConsultationPlan && atLeast2Sections()
            ? 'col-md-9'
            : 'col-md-10 col-md-offset-1'
        }>
        <h2 className="text-center">{step.title}</h2>
        <div className="mb-30 project__step-dates text-center">
          {(step.timeRange.startAt || step.timeRange.endAt) && (
            <div className="mr-15 d-ib">
              <i className="cap cap-calendar-2-1"/>{' '}
              <DatesInterval
                startAt={step.timeRange.startAt}
                endAt={step.timeRange.endAt}
                fullDay
              />
            </div>
          )}
          {step.timeRange.endAt && step.status === 'OPENED' && !step.timeless && (
            <div className="mr-15 d-ib">
              <i className="cap cap-hourglass-1"/> <RemainingTime endAt={step.timeRange.endAt}/>
            </div>
          )}
        </div>
        <StepInfos step={step} />
        {step.consultation && (
            <SectionRecursiveList
              consultation={step.consultation}
            />
          )}
      </div>
    </>
  );
};

export default createFragmentContainer(ConsultationPropositionStep, {
  consultationStep: graphql`
      fragment ConsultationPropositionStep_consultationStep on ConsultationStep @argumentDefinitions(consultationSlug: { type: "String!" }) {
          ...StepInfos_step
          id
          timeRange {
              startAt
              endAt
          }
          title
          status
          timeless
          consultation(slug: $consultationSlug) {
              ...ConsultationPlan_consultation
              ...SectionRecursiveList_consultation @arguments(isAuthenticated: $isAuthenticated)
          }
      }
  `,
});
