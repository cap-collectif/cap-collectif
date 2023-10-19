import React from 'react'
import { Row } from 'react-bootstrap'
import ProjectList from '../List/ProjectsList'
import ProjectListFiltersContainer from '../List/Filters/ProjectListFiltersContainer'

export type Props = {
  limit?: number | null | undefined
  isProjectsPage?: boolean
}
export default class ProjectListPage extends React.Component<Props> {
  render() {
    const { limit, isProjectsPage } = this.props
    return (
      <div>
        <ProjectListFiltersContainer />
        <Row id="project-list">
          {/* @ts-expect-error defaultProps not working */}
          <ProjectList limit={limit} isProjectsPage={isProjectsPage} />
        </Row>
      </div>
    )
  }
}
