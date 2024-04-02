import * as React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import classNames from 'classnames'
import ProjectImage from './ProjectImage'
import Card from '../../Ui/Card/Card'
import type { ProjectCover_project$data } from '~relay/ProjectCover_project.graphql'

type Props = {
  readonly project: ProjectCover_project$data
}

class ProjectCover extends React.Component<Props> {
  render() {
    const { project } = this.props
    const link = project.isExternal ? project.externalLink : project.url
    const linkClasses =
      project.cover && project.cover.url
        ? classNames({
            bg__wrapper: !project.cover.url,
          })
        : ''
    return (
      <Card.Cover>
        <a href={link} alt={project.title} className={linkClasses}>
          <ProjectImage project={project} />
        </a>
      </Card.Cover>
    )
  }
}

export default createFragmentContainer(ProjectCover, {
  project: graphql`
    fragment ProjectCover_project on Project {
      title
      cover {
        url
      }
      isExternal
      externalLink
      url
      ...ProjectImage_project
    }
  `,
})
