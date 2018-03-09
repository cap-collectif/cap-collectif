// @flow
import * as React from 'react';
import ProjectPreviewCounter from './ProjectPreviewCounter';
import TagsList from '../../Ui/List/TagsList';

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
    return (
      <TagsList>
        <ProjectPreviewCounter
          value={project.contributionsCount}
          label="project.preview.counters.contributions"
          showZero
          icon="cap-baloon-1"
        />
        <ProjectPreviewCounter
          value={project.votesCount}
          label="project.preview.counters.votes"
          icon="cap-user-2-1"
        />
        <ProjectPreviewCounter
          value={project.participantsCount}
          label="project.preview.counters.contributors"
          showZero
          icon="cap-hand-like-2-1"
        />
      </TagsList>
    );
  },
});

export default ProjectPreviewCounters;
