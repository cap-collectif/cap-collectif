// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import WYSIWYGRender from '../../Form/WYSIWYGRender';
import type { StepPageFooter_step } from '~relay/StepPageFooter_step.graphql';

type Props = {
  step: StepPageFooter_step,
};

class StepPageFooter extends React.Component<Props> {
  render() {
    const { step } = this.props;
    const { footer } = step;
    if (!footer) {
      return null;
    }
    return (
      <div>
        <div className="block block--bordered mt-10 p-15">
          <WYSIWYGRender value={footer} />
        </div>
      </div>
    );
  }
}

export default createFragmentContainer(
  StepPageFooter,
  graphql`
    fragment StepPageFooter_step on QuestionnaireStep {
      footer
    }
  `,
);
