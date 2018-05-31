// @flow
import * as React from 'react';

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
          <div style={{ padding: 10 }}>
            <div dangerouslySetInnerHTML={{ __html: footer }} />
          </div>
        </div>
      </div>
    );
  }
}

export default StepPageFooter;
