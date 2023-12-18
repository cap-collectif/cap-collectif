import { $Keys } from 'utility-types'
// TODO: change when the page is complete
export const getProjectAdminBaseUrl = (projectId: string, isAdminNext: boolean = false) =>
  isAdminNext ? `/admin-next/project/${projectId}` : `/admin/alpha/project/${projectId}`
const PROJECT_ROUTE = {
  CONTRIBUTIONS: '/contributions',
  PARTICIPANTS: '/participants',
  ANALYSIS: '/analysis',
  CONFIGURATION: '/edit',
  MEDIATOR: '/mediators',
}

export const getProjectAdminPath = (
  projectId: string,
  type: $Keys<typeof PROJECT_ROUTE>,
  newCreateProjectFlag: boolean | undefined = false,
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
      return newCreateProjectFlag
        ? `${getProjectAdminBaseUrl(projectId, true)}`
        : `${getProjectAdminBaseUrl(projectId)}${PROJECT_ROUTE.CONFIGURATION}`
    default:
      return getProjectAdminBaseUrl(projectId)
  }
}
export type ProjectAdminPageStatus = 'ready' | 'loading'
