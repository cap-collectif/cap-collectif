// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import RemainingTime from '../../Utils/RemainingTime';
import DatesInterval from '../../Utils/DatesInterval';
import { type StepPageHeader_step } from '~relay/StepPageHeader_step.graphql';
import BodyInfos from '../../Ui/Boxes/BodyInfos';

type Props = {
  step: StepPageHeader_step,
};

export class StepPageHeader extends React.Component<Props> {
  stepIsParticipative() {
    const { step } = this.props;

    return (
      step &&
      (step.type === 'consultation' ||
        step.type === 'collect' ||
        step.type === 'questionnaire' ||
        (step.type === 'selection' && step.votable === true))
    );
  }

  render() {
    const { step } = this.props;
    return (
      <div>
        <h2 className="h2">{step.title}</h2>
        <div className="mb-30 project__step-dates">
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
          {step.timeRange.endAt &&
            step.status === 'OPENED' &&
            !step.timeless &&
            this.stepIsParticipative() && (
              <div className="mr-15 d-ib hidden-print">
                <i className="cap cap-hourglass-1" /> <RemainingTime endAt={step.timeRange.endAt} />
              </div>
            )}
        </div>
        {step.type === 'selection' && step.voteThreshold && step.voteThreshold > 0 ? (
          <h4 style={{ marginBottom: '20px' }}>
            <i className="cap cap-hand-like-2-1" style={{ fontSize: '22px', color: '#377bb5' }} />{' '}
            <FormattedMessage
              id="proposal.vote.threshold.step"
              values={{
                num: step.voteThreshold,
              }}
            />
          </h4>
        ) : null}
        <BodyInfos body={step.body} />
      </div>
    );
  }
}

export default createFragmentContainer(StepPageHeader, {
  step: graphql`
    fragment StepPageHeader_step on Step {
      body
      ... on SelectionStep {
        voteThreshold
        votable
      }
      status
      title
      timeless
      timeRange {
        startAt
        endAt
      }
      type
    }
  `,
});
