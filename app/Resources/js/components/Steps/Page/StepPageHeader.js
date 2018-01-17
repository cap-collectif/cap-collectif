import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import StepInfos from './StepInfos';

const StepPageHeader = React.createClass({
  propTypes: {
    step: PropTypes.object.isRequired,
  },

  render() {
    const { step } = this.props;
    return (
      <div>
        <h2 className="h2">{step.title}</h2>
        <div className="mb-15">
          <span className="mr-15">
            <i className="cap cap-calendar-2-1" /> du 26 au 30 sept ..
          </span>
          <span className="mr-15">
            <i className="cap cap-hourglass-1" /> 25jours restants
          </span>
          <span>
            <i className="cap cap-business-chart-2-1" />
            <a href="" />
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
  },
});

export default StepPageHeader;
