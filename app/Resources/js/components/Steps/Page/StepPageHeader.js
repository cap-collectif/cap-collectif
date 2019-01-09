// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import RemainingTime from '../../Utils/RemainingTime';
import DatesInterval from '../../Utils/DatesInterval';
import StepInfos from './StepInfos';
import { type StepPageHeader_step } from './__generated__/StepPageHeader_step.graphql';

type Props = {
  step: StepPageHeader_step,
};

class StepPageHeader extends React.Component<Props> {
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
          {(step.startAt || step.endAt) && (
            <div className="mr-15 d-ib">
              <i className="cap cap-calendar-2-1" />{' '}
              <DatesInterval startAt={step.startAt} endAt={step.endAt} fullDay />
            </div>
          )}
          {step.endAt && step.status === 'OPENED' && !step.timeless && this.stepIsParticipative() && (
            <div className="mr-15 d-ib hidden-print">
              <i className="cap cap-hourglass-1" /> <RemainingTime endAt={step.endAt} />
            </div>
          )}
          {step.type !== 'questionnaire' && (
            <div className="d-ib">
              <i className="cap cap-business-chart-2-1" />{' '}
              {/* <a href={step._links.stats}>
                <FormattedMessage id="project.show.meta.info.stats" />
          </a> */}
            </div>
          )}
        </div>
        {step.type === 'selection' && step.voteThreshold && step.voteThreshold > 0 && (
          <h4 style={{ marginBottom: '20px' }}>
            <i className="cap cap-hand-like-2-1" style={{ fontSize: '22px', color: '#377bb5' }} />{' '}
            <FormattedMessage
              id="proposal.vote.threshold.step"
              values={{
                num: step.voteThreshold,
              }}
            />
          </h4>
        )}
        <StepInfos step={step} />
      </div>
    );
  }
}

export default createFragmentContainer(
  StepPageHeader,
  graphql`
    fragment StepPageHeader_step on Step {
      ... on SelectionStep {
        voteThreshold
        votable
      }
      id
      body
      status
      title
      timeless
      startAt
      endAt
      type
    }
  `,
);
