import React from 'react';
import CountersNav from './CountersNav';
import StepText from './StepText';
import { IntlMixin, FormattedMessage } from 'react-intl';

const StepInfos = React.createClass({
  displayName: 'StepInfos',
  propTypes: {
    step: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { step } = this.props;
    const counters = step.counters;
    const body = step.body;
    if (!body) {
      return null;
    }

    return (
      <div>
        {
          (step.step_type === 'selection' && step.voteThreshold > 0) &&
          <h4>
            <i className="cap cap-hand-like-2-1"></i>{' '}
            <FormattedMessage message={this.getIntlMessage('proposal.vote.threshold.step')} num={step.voteThreshold} />
          </h4>
        }
        <div className="step__infos block block--bordered">
          <CountersNav counters={counters} bordered={!!body} />
          <StepText text={body} />
        </div>
      </div>
    );
  },

});

export default StepInfos;
