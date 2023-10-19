import * as React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import { FormattedMessage } from 'react-intl'
import Card from '../../Ui/Card/Card'
import type { ProjectType_project } from '~relay/ProjectType_project.graphql'
import colors from '~/styles/modules/colors'
type Props = {
  readonly project: ProjectType_project
}
export class ProjectType extends React.Component<Props> {
  render() {
    const { project } = this.props
    const bgColor = project.archived ? colors['neutral-gray']['400'] : project?.type?.color
    return project.type ? (
      <Card.Type bgColor={bgColor}>
        <FormattedMessage id={project.type.title} />
      </Card.Type>
    ) : null
  }
}
export default createFragmentContainer(ProjectType, {
  project: graphql`
    fragment ProjectType_project on Project {
      type {
        title
        color
      }
      archived
    }
  `,
})
