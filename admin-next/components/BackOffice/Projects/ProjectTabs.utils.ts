import { ProjectIdQuery$data } from '@relay/ProjectIdQuery.graphql'
import { fromGlobalId } from '@shared/utils/fromGlobalId'

const getProjectAdminBaseUrl = (projectId: string, isAdminNext: boolean = false) =>
  isAdminNext ? `/admin-next/project/${projectId}` : `/admin/alpha/project/${projectId}`

type ProjectRoute = {
  CONFIGURATION: string
  ANALYSIS: string
  CONTRIBUTIONS: string
  PARTICIPANTS: string
  MEDIATOR: string
}

const PROJECT_ROUTE: ProjectRoute = {
  CONTRIBUTIONS: '/contributions',
  PARTICIPANTS: '/participants',
  ANALYSIS: '/analysis',
  CONFIGURATION: '/edit',
  MEDIATOR: '/mediators',
}

export const getProjectAdminPath = (
  projectGlobalId: string,
  type: keyof ProjectRoute,
  isNewBackOfficeEnabled: boolean = false,
): string => {
  const projectId = fromGlobalId(projectGlobalId).id
  switch (type) {
    case 'CONTRIBUTIONS':
      return `${getProjectAdminBaseUrl(projectId)}${PROJECT_ROUTE.CONTRIBUTIONS}`
    case 'PARTICIPANTS':
      return `${getProjectAdminBaseUrl(projectId)}${PROJECT_ROUTE.PARTICIPANTS}`
    case 'ANALYSIS':
      return `${getProjectAdminBaseUrl(projectId)}${PROJECT_ROUTE.ANALYSIS}`
    case 'CONFIGURATION':
      if (isNewBackOfficeEnabled) {
        return `${getProjectAdminBaseUrl(projectGlobalId, true)}`
      }
      return `${getProjectAdminBaseUrl(projectId)}${PROJECT_ROUTE.CONFIGURATION}`
    case 'MEDIATOR':
      return `${getProjectAdminBaseUrl(projectGlobalId, true)}${PROJECT_ROUTE.MEDIATOR}`
    default:
      return getProjectAdminBaseUrl(projectGlobalId)
  }
}

export type ProjectAdminPageStatus = 'ready' | 'loading'

export const getContributionsPath = (baseUrl: string, type: string, stepId?: string, stepSlug?: string | null) => {
  switch (type) {
    case 'CollectStep':
    case 'SelectionStep':
      return `${baseUrl}/proposals${stepId ? `?step=${encodeURIComponent(stepId)}` : ''}`
    case 'DebateStep':
      return `${baseUrl}/debate/${stepSlug || ':stepSlug'}`
    case 'QuestionnaireStep':
      return `${baseUrl}/questionnaire/${stepSlug || ':stepSlug'}`
    default:
      return baseUrl
  }
}
export const getRouteContributionPath = (
  project: ProjectIdQuery$data['node'],
  baseUrlContributions: string,
  firstCollectStepId?: string,
): string => {
  const collectSteps = project.steps.filter(step => step.__typename === 'CollectStep')
  const debateSteps = project.steps.filter(step => step.__typename === 'DebateStep')
  const questionnaireSteps = project.steps.filter(step => step.__typename === 'QuestionnaireStep')

  const hasCollectStep = collectSteps.length > 0
  const hasDebateStep = debateSteps.length > 0
  const hasQuestionnaireSteps = questionnaireSteps.length > 0

  const onlyDebateStep =
    !hasCollectStep && !hasQuestionnaireSteps && debateSteps.length === 1 && !!project.firstDebateStep
  const onlyCollectStep = !hasDebateStep && !hasQuestionnaireSteps && collectSteps.length === 1 && firstCollectStepId
  const onlyQuestionnaireStep =
    !hasCollectStep && !hasDebateStep && questionnaireSteps.length === 1 && !!project.firstQuestionnaireStep

  if (onlyCollectStep && firstCollectStepId) {
    return getContributionsPath(baseUrlContributions, 'CollectStep', firstCollectStepId)
  }

  if (onlyDebateStep && project.firstDebateStep) {
    return getContributionsPath(
      baseUrlContributions,
      'DebateStep',
      project.firstDebateStep.id,
      project.firstDebateStep.slug,
    )
  }

  if (onlyQuestionnaireStep && project.firstQuestionnaireStep) {
    return getContributionsPath(
      baseUrlContributions,
      'QuestionnaireStep',
      project.firstQuestionnaireStep.id,
      project.firstQuestionnaireStep.slug,
    )
  }

  return baseUrlContributions
}
