import React from 'react';
import StepPreview from './StepPreview';

const StepsList = React.createClass({
  propTypes: {
    steps: React.PropTypes.array,
    style: React.PropTypes.object,
    votes: React.PropTypes.object,
  },

  getDefaultProps() {
    return {
      steps: [],
      style: {},
      votes: {},
    };
  },

  render() {
    if (this.props.steps.length === 0) {
      return null;
    }
    return (
      <div className="navbar--sub" style={this.props.style}>
        <ul className="nav">
          {
            this.props.steps.map((step) => {
              return <StepPreview key={step.id} step={step} votes={this.props.votes[step.id]} />;
            })
          }
        </ul>
      </div>
    );
  },

});

export default StepsList;
