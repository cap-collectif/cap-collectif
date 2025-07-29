import type { FC } from 'react'
import { useIntl } from 'react-intl'
import Layout from '../Layout/Layout'
import DashboardContent from './DashboardContent'
import { COUNT_PROJECT_PAGINATION } from './DashboardFilters/DashboardFilters'
import { graphql, useLazyLoadQuery } from 'react-relay'
import type { DashboardContainerQuery } from '@relay/DashboardContainerQuery.graphql'
import { useAppContext } from '../AppProvider/App.context'

const QUERY = graphql`
  query DashboardContainerQuery($affiliations: [ProjectAffiliation!], $count: Int!, $cursor: String) {
    viewer {
      allProject: projects(affiliations: $affiliations) {
        totalCount
      }
      organizations {
        allProjectOrganization: projects {
          totalCount
        }
        inProgressProjectsOrganization: projects(status: 1) {
          totalCount
        }
        doneProjectsOrganization: projects(status: 2) {
          totalCount
        }
      }
      inProgressProjects: projects(affiliations: $affiliations, status: 1) {
        totalCount
      }
      doneProjects: projects(affiliations: $affiliations, status: 2) {
        totalCount
      }
      ...DashboardContent_viewer @arguments(affiliations: $affiliations, count: $count, cursor: $cursor)
    }
  }
`

const DashboardContainer: FC = () => {
  const intl = useIntl()
  const { viewerSession } = useAppContext()
  const query = useLazyLoadQuery<DashboardContainerQuery>(QUERY, {
    affiliations: viewerSession.isAdmin ? null : ['OWNER'],
    count: COUNT_PROJECT_PAGINATION,
    cursor: null,
  })
  const { viewer } = query
  const { allProject, inProgressProjects, doneProjects } = viewer
  const { allProjectOrganization, inProgressProjectsOrganization, doneProjectsOrganization } = viewer.organizations?.[0] || {}
  return (
    <Layout
      navTitle={intl.formatMessage({ id: 'dashboard-platform' })}
      navData={[
        {
          label: intl.formatMessage(
            { id: 'global.project-dynamic' },
            { num: allProject.totalCount || allProjectOrganization?.totalCount || 0 },
          ),
          number: {
            color: 'blue.500',
            label: allProject.totalCount || allProjectOrganization?.totalCount || 0,
          },
        },
        {
          label: intl.formatMessage({ id: 'global.in-progress' }),
          number: {
            color: 'orange.500',
            label: inProgressProjects.totalCount || inProgressProjectsOrganization?.totalCount || 0,
          },
        },
        {
          label: intl.formatMessage(
            { id: 'global.done-dynamic' },
            { num: doneProjects.totalCount || doneProjectsOrganization?.totalCount || 0 },
          ),
          number: {
            color: 'green.500',
            label: doneProjects.totalCount || doneProjectsOrganization?.totalCount || 0,
          },
        },
      ]}
    >
      <DashboardContent viewer={viewer} />
    </Layout>
  )
}

export default DashboardContainer
