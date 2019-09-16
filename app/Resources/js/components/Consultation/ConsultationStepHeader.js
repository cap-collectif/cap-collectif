// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from "react-intl";
import type { ConsultationStepHeader_step } from '~relay/ConsultationStepHeader_step.graphql';
import DatesInterval from '../Utils/DatesInterval';
import RemainingTime from '../Utils/RemainingTime';
import BodyInfos from '../Ui/Boxes/BodyInfos';

type RelayProps = {|
  +step: ConsultationStepHeader_step
|}

type Props = {|
  ...RelayProps,
|}

export const ConsultationStepHeader = ({ step }: Props) => {
  const { timeless, timeRange: { startAt, endAt }, project: { hasParticipativeStep } } = step;
  return (
    <React.Fragment>
      {!timeless &&
      <div className="row mb-30 text-center">
        <div className="mr-15 d-ib">
          <i className="cap cap-calendar-2-1"/>{' '}
          <DatesInterval startAt={startAt} endAt={endAt} fullDay month="short" showCurrentYear={false}/>
        </div>
        {step.timeRange.endAt && step.status === 'OPENED' && !step.timeless && (
          <div className="mr-15 d-ib">
            <i className="cap cap-hourglass-1"/> <RemainingTime endAt={step.timeRange.endAt}/>
          </div>
        )}
      </div>
      }
      {hasParticipativeStep &&
        <div className="mb-30 project__step__consultation--counters text-center">
          <div className="mr-15 d-ib">
            <i className="cap cap-hand-like-2-1" /> {step.votesCount || 0}{' '}
            <FormattedMessage
              id="project.preview.counters.votes"
              values={{ num: step.votesCount }}
            />
          </div>
          <div className="mr-15 d-ib">
            <i className="cap cap-user-2-1" /> {step.contributors.totalCount}{' '}
            <FormattedMessage
              id="project.preview.counters.contributors"
              values={{ num: step.contributors.totalCount }}
            />
          </div>
        </div>
      }
      {step.body && <BodyInfos maxLines={7} body={step.body}/>}
    </React.Fragment>
  );
};

export default createFragmentContainer(ConsultationStepHeader, {
  step: graphql`
      fragment ConsultationStepHeader_step on ConsultationStep @argumentDefinitions(exceptStepId: { type: "ID", defaultValue: null }) {
          project {
              hasParticipativeStep(exceptStepId: $exceptStepId)
          }
          votesCount
          contributors {
              totalCount
          }
          status
          timeless
          timeRange {
              startAt
              endAt
          }
          body
      }
  `,
});
