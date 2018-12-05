// @flow
import * as React from 'react';
import ProjectPreviewCounter from './ProjectPreviewCounter';
import TagsList from '../../Ui/List/TagsList';
import ProjectRestrictedAccess from '../Page/ProjectRestrictedAccess';

type Props = {
  project: Object,
};

class ProjectPreviewCounters extends React.Component<Props> {
  getNbCounters = () => {
    const { project } = this.props;
    const votesCount = project.votesCount;
    let nb = 2;
    nb += votesCount ? 1 : 0;
    return nb;
  };

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
          icon="cap-hand-like-2-1"
        />
        <ProjectPreviewCounter
          value={project.participantsCount}
          label="project.preview.counters.contributors"
          showZero
          icon="cap-user-2-1"
        />
        <div className="tags-list__tag">
          <ProjectRestrictedAccess projectId={project.id} icon="cap-lock-2-1" />
        </div>
      </TagsList>
    );
  }
}

export default ProjectPreviewCounters;
