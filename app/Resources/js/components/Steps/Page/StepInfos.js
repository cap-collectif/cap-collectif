import React from 'react';
import CountersNav from './CountersNav';
import StepText from './StepText';

const StepInfos = React.createClass({
  propTypes: {
    step: React.PropTypes.object.isRequired,
  },

  render() {
    const { step } = this.props;
    const counters = step.counters;
    const body = step.body;
    return (
      <div className="step__infos block block--bordered">
        <CountersNav counters={counters} bordered={!!body} />
        <StepText text={body} />
      </div>
    );
  },

});

export default StepInfos;
