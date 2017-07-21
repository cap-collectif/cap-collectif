// @flow
import React from 'react';
import ProjectPreviewCounter from './ProjectPreviewCounter';

const ProjectPreviewCounters = React.createClass({
  propTypes: {
    project: React.PropTypes.object.isRequired,
  },

  getNbCounters() {
    const { project } = this.props;
    const votesCount = project.votesCount;
    let nb = 2;
    nb += votesCount ? 1 : 0;
    return nb;
  },

  render() {
    const { project } = this.props;
    const nbCounters = this.getNbCounters();
    const counterWidth = `${100 / nbCounters}%`;
    return (
      <div className="thumbnail__numbers">
        <ProjectPreviewCounter
          value={project.contributionsCount}
          label="project.preview.counters.contributions"
          style={{ width: counterWidth }}
          showZero
        />
        <ProjectPreviewCounter
          value={project.votesCount}
          label="project.preview.counters.votes"
          style={{ width: counterWidth }}
        />
        <ProjectPreviewCounter
          value={project.participantsCount}
          label="project.preview.counters.contributors"
          style={{ width: counterWidth }}
          showZero
        />
      </div>
    );
  },
});

export default ProjectPreviewCounters;
