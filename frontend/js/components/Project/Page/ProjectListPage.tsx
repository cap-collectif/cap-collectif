import React, { useEffect } from 'react'
import { Row } from 'react-bootstrap'
import ProjectList from '../List/ProjectsList'
import ProjectListFiltersContainer from '../List/Filters/ProjectListFiltersContainer'
import { dispatchNavBarEvent } from '@shared/navbar/NavBar.utils'
import { useIntl } from 'react-intl'

export type Props = {
  limit?: number | null | undefined
  isProjectsPage?: boolean
}

export const ProjectListPage = ({ limit, isProjectsPage }: Props) => {
  const intl = useIntl()

  useEffect(() => {
    if (isProjectsPage) {
      dispatchNavBarEvent('set-breadcrumb', [
        { title: intl.formatMessage({ id: 'navbar.homepage' }), href: '/' },
        { title: intl.formatMessage({ id: 'global.project.label' }), href: '' },
      ])
    }
  }, [intl, isProjectsPage])

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
