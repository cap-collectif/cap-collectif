// @flow
import React from 'react';
import CountersNav from './CountersNav';
import StepText from './StepText';

type Props = {
  step: Object,
};

class StepInfos extends React.Component<Props> {
  render() {
    const { step } = this.props;
    const counters = step.counters;
    const body = step.body;
    if (!body) {
      return null;
    }

    return (
      <div>
        <div className="step__infos block">
          <CountersNav counters={counters} bordered={!!body} />
          <StepText text={body} />
        </div>
      </div>
    );
  }
}

export default StepInfos;
