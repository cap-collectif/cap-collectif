// @flow
import React from 'react';
import StepText from './StepText';

type Props = {
  step: Object,
};

class StepInfos extends React.Component<Props> {
  render() {
    const { step } = this.props;
    const body = step.body;
    if (!body) {
      return null;
    }

    return (
      <div>
        <div className="step__infos block">
          <StepText text={body} />
        </div>
      </div>
    );
  }
}

export default StepInfos;
