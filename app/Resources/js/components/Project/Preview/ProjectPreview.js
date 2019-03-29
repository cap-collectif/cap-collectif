// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { Col } from 'react-bootstrap';
import ProjectType from './ProjectType';
import ProjectCover from './ProjectCover';
import ProjectPreviewBody from './ProjectPreviewBody';
import { Card } from '../../Ui/Card/Card';
import type { ProjectPreview_project } from '~relay/ProjectPreview_project.graphql';

type Props = {
  project: ProjectPreview_project,
  hasSecondTitle?: boolean,
};

export class ProjectPreview extends React.Component<Props> {
  render() {
    const { project, hasSecondTitle } = this.props;
    const projectID = project.id ? `project-preview-${project.id}` : 'project-preview';
    return (
      <Col xs={12} sm={6} md={4} lg={3} className="d-flex">
        <Card id={projectID} className="project-preview">
          {/* $FlowFixMe $fragmentRefs */}
          <ProjectType project={project} />
          {/* $FlowFixMe $fragmentRefs */}
          <ProjectCover project={project} />
          {/* $FlowFixMe $fragmentRefs */}
          <ProjectPreviewBody project={project} hasSecondTitle={hasSecondTitle} />
        </Card>
      </Col>
    );
  }
}

export default createFragmentContainer(ProjectPreview, {
  project: graphql`
    fragment ProjectPreview_project on Project {
      id
      ...ProjectPreviewBody_project
      ...ProjectType_project
      ...ProjectCover_project
    }
  `,
});
