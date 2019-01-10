// @flow
import * as React from 'react';
import WYSIWYGRender from '../../Form/WYSIWYGRender';

type Props = {
  step: {
    footer: ?string,
  },
};

class StepPageFooter extends React.Component<Props> {
  render() {
    const { step } = this.props;
    const footer = step.footer;
    if (!footer) {
      return null;
    }
    return (
      <div>
        <div className="block block--bordered" style={{ marginTop: 30 }}>
          <WYSIWYGRender className="p-10" value={footer} />
        </div>
      </div>
    );
  }
}

export default StepPageFooter;
