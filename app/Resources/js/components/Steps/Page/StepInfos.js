// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import StepText from './StepText';
import { Card } from '../../Ui/Card/Card';
import type { StepInfos_step } from '~relay/StepInfos_step.graphql';

type Props = {|
  +step: StepInfos_step,
  +maxLength?: number
|};

export class StepInfos extends React.Component<Props> {

  static defaultProps = {
    truncated: false
  };

  render() {
    const { step, maxLength } = this.props;
    const { body } = step;
    return body ? (
      <Card>
        <Card.Body>
          <StepText
            { ...((maxLength) ? { maxLength } : {} ) }
            text={body} />
        </Card.Body>
      </Card>
    ) : null;
  }
}

export default createFragmentContainer(StepInfos, {
  step: graphql`
    fragment StepInfos_step on Step {
      body
    }
  `,
});
