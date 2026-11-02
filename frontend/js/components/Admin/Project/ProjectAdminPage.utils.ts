// TODO: change when the page is complete
export const getProjectAdminBaseUrl = (projectId: string, isAdminNext: boolean = false) =>
  isAdminNext ? `/admin-next/project/${projectId}` : `/admin/alpha/project/${projectId}`
const PROJECT_ROUTE = {
  CONTRIBUTIONS: '/contributions',
  PARTICIPANTS: '/participants',
  ANALYSIS: '/analysis',
  MEDIATOR: '/mediators',
}
type ProjectRoute = 'CONFIGURATION' | keyof typeof PROJECT_ROUTE

export const getProjectAdminPath = (
  projectId: string,
  type: ProjectRoute,
): string => {
  switch (type) {
    case 'CONTRIBUTIONS':
      return `${getProjectAdminBaseUrl(projectId)}${PROJECT_ROUTE.CONTRIBUTIONS}`

    case 'PARTICIPANTS':
      return `${getProjectAdminBaseUrl(projectId)}${PROJECT_ROUTE.PARTICIPANTS}`

    case 'ANALYSIS':
      return `${getProjectAdminBaseUrl(projectId)}${PROJECT_ROUTE.ANALYSIS}`
    case 'MEDIATOR':
      return `${getProjectAdminBaseUrl(projectId, true)}${PROJECT_ROUTE.MEDIATOR}`
    case 'CONFIGURATION':
      return getProjectAdminBaseUrl(projectId, true)
    default:
      return getProjectAdminBaseUrl(projectId)
  }
}
export type ProjectAdminPageStatus = 'ready' | 'loading'
