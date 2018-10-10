// @flow
import React from 'react';
import StepText from './StepText';
import { CardContainer } from '../../Ui/Card/CardContainer';

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
      <CardContainer>
        <div className="card__body">
          <StepText text={body} />
        </div>
      </CardContainer>
    );
  }
}

export default StepInfos;
