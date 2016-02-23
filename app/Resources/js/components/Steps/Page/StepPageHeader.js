import React from 'react';
import StepInfos from './StepInfos';

const StepPageHeader = React.createClass({
  propTypes: {
    step: React.PropTypes.object.isRequired,
  },

  render() {
    const { step } = this.props;
    return (
      <div>
        <h2 className="h2">{step.title}</h2>
        <StepInfos step={step} />
      </div>
    );
  },

});

export default StepPageHeader;
