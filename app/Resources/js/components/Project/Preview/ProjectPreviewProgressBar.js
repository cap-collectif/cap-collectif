import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import ProjectPreviewProgressBarItem from './ProjectPreviewProgressBarItem';

const ProjectPreviewProgressBar = React.createClass({
  propTypes: {
    project: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getCompletedStepsNb() {
    const completedSteps = this.props.project.steps.filter((step) => {
      return step.status === 'closed';
    });
    return completedSteps.length;
  },

  getCompletedStepsPercentage() {
    const completedStepsNb = this.getCompletedStepsNb();
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
            project.steps.sort((a, b) => a.position - b.position).map((step, index) => {
              return (
                <ProjectPreviewProgressBarItem
                  key={index}
                  step={step}
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
