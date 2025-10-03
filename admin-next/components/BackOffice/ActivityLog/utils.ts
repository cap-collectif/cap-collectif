export const CONNECTION_NODES_PER_PAGE = 50

export const userRoleFilterItems = [
  { value: 'ALL', label: 'users' }, // Tous les utilisateurices
  { value: 'ROLE_ADMIN', label: 'global.admin' }, // Admin
  { value: 'ORGANIZATION_ADMIN', label: 'roles.organization-admin' }, // Admin d'organisation
  { value: 'ORGANIZATION_MEMBER', label: 'project-manager-rights' }, // Gestionnaire de projet
  { value: 'ROLE_PROJECT_ADMIN', label: 'roles.project_admin' }, // Créateurice de projet
]

export const actionMenuFilterItems = [
  { value: 'ALL', label: 'activity-log.all-actions' },
  { value: 'CREATE', label: 'activity-log.create' },
  { value: 'EDIT', label: 'activity-log.edit' },
  { value: 'DELETE', label: 'activity-log.delete' },
  { value: 'SHOW', label: 'activity-log.show' },
  { value: 'EXPORT', label: 'activity-log.export' },
]

export const getLogActionType = (actionType: string) => {
  switch (actionType) {
    case 'CREATE':
      return 'activity-log.action.create'
    case 'EDIT':
      return 'activity-log.action.edit'
    case 'DELETE':
      return 'activity-log.action.delete'
    case 'EXPORT':
      return 'activity-log.action.export'
    case 'SHOW':
      return 'activity-log.action.view'
    default:
      return ''
  }
}
