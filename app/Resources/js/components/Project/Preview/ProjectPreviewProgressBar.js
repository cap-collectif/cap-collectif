import React from 'react';
import { IntlMixin } from 'react-intl';
import ProjectPreviewProgressBarItem from './ProjectPreviewProgressBarItem';

const ProjectPreviewProgressBar = React.createClass({
  propTypes: {
    project: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      completedStepsNb: this.getCompletedStepsNb(),
    };
  },

  getCompletedStepsNb() {
    const completedSteps = this.props.project.steps.filter((pas) => {
      return pas.step.openingStatus === 'closed';
    });
    return completedSteps.length;
  },

  getCompletedStepsPercentage() {
    const { completedStepsNb } = this.state;
    const total = this.props.project.steps.length;
    const percentage = completedStepsNb > 0 && total > 0
      ? completedStepsNb / total * 100
      : 0;
    return Math.round(percentage);
  },

  render() {
    const { project } = this.props;
    const nbSteps = project.steps.length;
    if (nbSteps > 0) {
      const width = 100 / nbSteps + '%';
      return (
        <div className="thumbnail__steps-bar">
          {
            project.steps.map((pas, index) => {
              return (
                <ProjectPreviewProgressBarItem
                  key={index}
                  projectStep={pas}
                  style={{ width: width }}
                />
              );
            })
          }
          <span className="thumbnail__steps-bar__percentage">
            {this.getCompletedStepsPercentage() + '%'}
          </span>
        </div>
      );
    }
    return null;
  },

});

export default ProjectPreviewProgressBar;
