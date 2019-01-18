// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import classNames from 'classnames';
import ProjectImage from './ProjectImage';
import CardCover from '../../Ui/Card/CardCover';
import type { ProjectCover_project } from './__generated__/ProjectCover_project.graphql';

type Props = { project: ProjectCover_project };

class ProjectCover extends React.Component<Props> {
  render() {
    const { project } = this.props;
    const link = project.links && project.links.external ? project.links.external : project.url;
    const linkClasses =
      project.cover && project.cover.url
        ? classNames({
            bg__wrapper: !project.cover.url,
          })
        : '';

    return (
      <CardCover>
        <a href={link} alt={project.title} className={linkClasses}>
          {/* $FlowFixMe $fragmentRefs */}
          <ProjectImage project={project} />
        </a>
      </CardCover>
    );
  }
}

export default createFragmentContainer(ProjectCover, {
  project: graphql`
    fragment ProjectCover_project on Project {
      title
      cover {
        url
      }
      links {
        external
      }
      url
      ...ProjectImage_project
    }
  `,
});
