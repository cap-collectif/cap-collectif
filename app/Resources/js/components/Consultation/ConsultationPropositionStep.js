// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import styled, { css } from 'styled-components';
import { FormattedMessage } from 'react-intl';
import ConsultationPlan from './ConsultationPlan';
import DatesInterval from '../Utils/DatesInterval';
import RemainingTime from '../Utils/RemainingTime';
import SectionRecursiveList from './SectionRecursiveList';
import type { ConsultationPropositionStep_consultationStep } from '~relay/ConsultationPropositionStep_consultationStep.graphql';
import { STEP_PROPOSITION_NAVIGATION_HEIGHT } from '../Steps/StepPropositionNavigationBox';
import { breakpoint } from '../../utils/mixins';
import UserAvatarList from '../User/UserAvatarList';
import BodyInfos from '../Ui/Boxes/BodyInfos';

type RelayProps = {|
  +consultationStep: ConsultationPropositionStep_consultationStep,
|};

type Props = {|
  ...RelayProps,
  +consultationPlanEnabled: boolean,
  +showConsultationPlan: boolean,
  +isMultiConsultation: boolean,
|};

const STICKY_OFFSET_TOP = 60;

const ConsultationPlanInner = styled.div`
  top: inherit;
  ${breakpoint('large', css`
    top: ${({ offset }) => `${offset}px`}
  `)}
`;

export const ConsultationPropositionStep = (props: Props) => {
  const { consultationPlanEnabled, showConsultationPlan, consultationStep: step, isMultiConsultation } = props;
  const stepNavigationHeaderRef = React.useRef<?HTMLDivElement>(null);
  const getStepNavigationHeader: () => ?HTMLDivElement = () => {
    if (stepNavigationHeaderRef.current === null) {
      stepNavigationHeaderRef.current = ((document.querySelector('.step__propositions__navigation'): any): ?HTMLDivElement);
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
        <h2 className="text-center">{step.consultation ? step.consultation.title || step.title : step.title}</h2>
        <div className="mb-15 project__step-authors text-center">
          {isMultiConsultation && step.project && step.project.authors.length > 0 && (
            <div className="mr-15 d-ib">
              {/* $FlowFixMe $refType */}
              <UserAvatarList
                users={step.project.authors}
                max={3}
                avatarSize={35}
              />
              <FormattedMessage id="project.show.published_by"/>&nbsp;
              {step.project.authors
                .filter(Boolean)
                .map((author, index) =>
                  <span><a href={author.url}>{author.username}</a>{step.project && step.project.authors && index !== step.project.authors.length - 1 && ', '}</span>
                )
              }
            </div>
          )}
        </div>
        <div className="mb-15 project__step-dates text-center">
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
            <div className="d-ib">
              <i className="cap cap-hourglass-1"/> <RemainingTime endAt={step.timeRange.endAt}/>
            </div>
          )}
        </div>
        {isMultiConsultation && (
          <div className="mb-30 project__step__consultation--counters text-center">
            {step.consultation && (
              <div className="mr-15 d-ib">
                <i className="cap cap-baloon-1"/> {step.consultation.contributions && step.consultation.contributions.totalCount} <FormattedMessage id="project.preview.counters.contributions" values={{ num: step.consultation.contributions && step.consultation.contributions.totalCount }} />
              </div>
            )}
            {step.consultation && (
              <div className="mr-15 d-ib">
                <i className="cap cap-hand-like-2-1"/> {step.consultation.votesCount || 0} <FormattedMessage id="project.preview.counters.votes" values={{ num: step.consultation.votesCount }} />
              </div>
            )}
            {step.consultation && (
              <div className="mr-15 d-ib">
                <i className="cap cap-user-2-1"/> {step.consultation.contributors.totalCount} <FormattedMessage id="project.preview.counters.contributors" values={{ num: step.consultation.contributors.totalCount }} />
              </div>
            )}
          </div>
        )}
        {((step.consultation && step.consultation.description) || step.body) &&
          <BodyInfos body={step.consultation && step.consultation.description ? step.consultation.description : step.body || ''}/>
        }
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
      fragment ConsultationPropositionStep_consultationStep on ConsultationStep @argumentDefinitions(isMultiConsultation: { type: "Boolean!", defaultValue: false }, consultationSlug: { type: "String!" }) {
          body
          id
          timeRange {
              startAt
              endAt
          }
          title
          status
          timeless
          project @include(if: $isMultiConsultation)  {
              authors {
                  username
                  url
                  ...UserAvatarList_users
              }
          }
          consultation(slug: $consultationSlug) {
              title
              description
              contributions {
                  totalCount
              }
              contributors {
                  totalCount
              }
              votesCount
              ...ConsultationPlan_consultation
              ...SectionRecursiveList_consultation @arguments(isAuthenticated: $isAuthenticated)
          }
      }
  `,
});
