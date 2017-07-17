import React, { PropTypes } from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';
import StepInfos from './StepInfos';

const StepPageHeader = React.createClass({
  propTypes: {
    step: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { step } = this.props;
    return (
      <div>
        <h2 className="h2">{step.title}</h2>
        {
          (step.type === 'selection' && step.voteThreshold > 0) &&
            <h4 style={{ marginBottom: '20px' }}>
              <i className="cap cap-hand-like-2-1" style={{ fontSize: '22px', color: '#377bb5' }}></i>{' '}
              <FormattedMessage message={this.getIntlMessage('proposal.vote.threshold.step')} num={step.voteThreshold} />
            </h4>
        }
        <StepInfos step={step} />
      </div>
    );
  },

});

export default StepPageHeader;
