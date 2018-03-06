import React from 'react';
import StepPreview from './StepPreview';

const StepsList = React.createClass({
  propTypes: {
    steps: React.PropTypes.array,
    style: React.PropTypes.object,
    votes: React.PropTypes.object
  },

  getDefaultProps() {
    return {
      steps: [],
      style: {},
      votes: {}
    };
  },

  render() {
    const { steps, style, votes } = this.props;
    if (steps.length === 0) {
      return null;
    }
    return (
      <div className="navbar--sub" style={style}>
        <ul className="nav">
          {steps.map(step => {
            return <StepPreview key={step.id} step={step} votes={votes[step.id]} />;
          })}
        </ul>
      </div>
    );
  }
});

export default StepsList;
