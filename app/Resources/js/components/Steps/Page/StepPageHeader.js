import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import RemainingTime from './../../Utils/RemainingTime';
import DatesInterval from './../../Utils/DatesInterval';
import StepInfos from './StepInfos';

type Props = {
  step: Object,
};

export class StepPageHeader extends React.Component<Props> {
  render() {
    const { step } = this.props;

    console.log(step);

    return (
      <div>
        <h2 className="h2">{step.title}</h2>
        <div className="mb-30">
          {(step.startAt || step.endAt) && (
              <span className="mr-15">
                <i className="cap cap-calendar-2-1" />{' '}
                <DatesInterval startAt={step.startAt} endAt={step.endAt} fullDay />
              </span>
            )}
          {step.endAt && (
            <span className="mr-15">
              <i className="cap cap-hourglass-1" /> <RemainingTime endAt={step.endAt} />
            </span>
          )}
          <span>
            {/* To search + add condition for collect, selection, relaisation */}
            <i className="cap cap-business-chart-2-1" />{' '}
            <a href="">
              <FormattedMessage id="project.show.meta.info.stats" />
            </a>
            {/* <a href="{{ path('app_project_show_stats', {'projectSlug': project.slug }) }}"> */}
            {/* {{ 'project.show.meta.info.stats'|trans({}, 'CapcoAppBundle') }}  <i class="pull-right  excerpt  cap-arrow-66"></i> */}
            {/* </a> */}
          </span>
        </div>
        {step.type === 'selection' &&
          step.voteThreshold > 0 && (
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

export default StepPageHeader;
