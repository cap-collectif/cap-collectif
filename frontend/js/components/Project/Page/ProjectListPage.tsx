import { Row } from 'react-bootstrap'
import ProjectList from '../List/ProjectsList'
import ProjectListFiltersContainer from '../List/Filters/ProjectListFiltersContainer'

export type Props = {
  limit?: number | null | undefined
  isProjectsPage?: boolean
}

export const ProjectListPage = ({ limit, isProjectsPage }: Props) => {
  return (
    <div>
      <ProjectListFiltersContainer />
      <Row id="project-list">
        <ProjectList limit={limit} isProjectsPage={isProjectsPage} />
      </Row>
    </div>
  )
}

export default ProjectListPage
