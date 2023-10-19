import { $Keys } from 'utility-types'
// TODO: change when the page is complete
export const getProjectAdminBaseUrl = (projectId: string) => `/admin/alpha/project/${projectId}`
const PROJECT_ROUTE = {
  CONTRIBUTIONS: '/contributions',
  PARTICIPANTS: '/participants',
  ANALYSIS: '/analysis',
  CONFIGURATION: '/edit',
}
export const getProjectAdminPath = (projectId: string, type: $Keys<typeof PROJECT_ROUTE>): string => {
  switch (type) {
    case 'CONTRIBUTIONS':
      return `${getProjectAdminBaseUrl(projectId)}${PROJECT_ROUTE.CONTRIBUTIONS}`

    case 'PARTICIPANTS':
      return `${getProjectAdminBaseUrl(projectId)}${PROJECT_ROUTE.PARTICIPANTS}`

    case 'ANALYSIS':
      return `${getProjectAdminBaseUrl(projectId)}${PROJECT_ROUTE.ANALYSIS}`

    case 'CONFIGURATION':
      return `${getProjectAdminBaseUrl(projectId)}${PROJECT_ROUTE.CONFIGURATION}`

    default:
      return getProjectAdminBaseUrl(projectId)
  }
}
export type ProjectAdminPageStatus = 'ready' | 'loading'
