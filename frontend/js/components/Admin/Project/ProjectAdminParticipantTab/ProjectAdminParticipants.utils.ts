import { $PropertyType } from 'utility-types'
import isEqual from 'lodash/isEqual'
import uniqBy from 'lodash/uniqBy'
import type { ProjectAdminParticipants_project } from '~relay/ProjectAdminParticipants_project.graphql'
import type { Uuid } from '~/types'
import type { ProjectAdminParticipantState } from './ProjectAdminParticipant.reducer'
import { SHOWING_STEP_TYPENAME } from '~/constants/AnalyseConstants'
import { DEFAULT_FILTERS } from './ProjectAdminParticipant.context'
export type StepFilter = {
  readonly id: Uuid
  readonly title: string
}
export type UserTypeFilter = {
  readonly id: Uuid
  readonly name: string
}
type FilterOrderedFormatted = {
  readonly id: Uuid
  readonly name: string
  readonly type: 'step' | 'status'
  readonly action?: string
  readonly icon?: string
  readonly color?: string | null | undefined
  readonly isShow: boolean
}
export const getFormattedStepsChoicesForProject = (
  project: ProjectAdminParticipants_project,
): ReadonlyArray<StepFilter> => {
  return project.steps
    .filter(Boolean)
    .filter(step => SHOWING_STEP_TYPENAME.includes(step.__typename))
    .map(step => ({
      id: step.id,
      title: step.title,
    })) as any as ReadonlyArray<StepFilter>
}
export const getFormattedUserTypeChoicesForProject = (
  project: ProjectAdminParticipants_project,
): ReadonlyArray<UserTypeFilter> => {
  const usersTypes = project.participants?.edges
    ?.filter(Boolean)
    .map(edge => edge.node)
    .filter(Boolean)
    .filter(participant => participant.userType)
    .map(participant => ({
      id: participant.userType?.id,
      name: participant.userType?.name,
    })) as any as ReadonlyArray<UserTypeFilter>
  return uniqBy(usersTypes, 'id')
}
type AllFormattedChoicesReturn = {
  readonly steps: ReadonlyArray<StepFilter>
  readonly userTypes: ReadonlyArray<UserTypeFilter>
  readonly filtersOrdered: ReadonlyArray<FilterOrderedFormatted>
}

const getFormattedFiltersOrdered = (
  filtersOrdered: $PropertyType<ProjectAdminParticipantState, 'filtersOrdered'>,
  steps: ReadonlyArray<StepFilter>,
  userTypes: ReadonlyArray<UserTypeFilter>,
): ReadonlyArray<FilterOrderedFormatted> => {
  return filtersOrdered
    .map(filter => {
      if (filter.id === 'ALL' || filter.id === 'NONE') {
        return false
      }

      if (filter.type === 'step') {
        const step = steps.find(({ id }) => id === filter.id) as any as StepFilter
        if (!step) return null
        return {
          id: step.id,
          name: step.title,
          type: 'step',
          icon: 'stack',
          action: 'CLEAR_STEP_FILTER',
        }
      }

      if (filter.type === 'type') {
        const userType = userTypes.find(({ id }) => id === filter.id) as any as UserTypeFilter
        return {
          id: userType.id,
          name: userType.name,
          type: 'type',
          icon: 'singleManFilled',
          action: 'CLEAR_TYPE_FILTER',
        }
      }
    })
    .filter(Boolean) as any as ReadonlyArray<FilterOrderedFormatted>
}

export const getAllFormattedChoicesForProject = (
  project: ProjectAdminParticipants_project,
  filtersOrdered: $PropertyType<ProjectAdminParticipantState, 'filtersOrdered'>,
): AllFormattedChoicesReturn => {
  const steps = getFormattedStepsChoicesForProject(project)
  const userTypes = getFormattedUserTypeChoicesForProject(project)
  return {
    steps,
    userTypes,
    filtersOrdered: getFormattedFiltersOrdered(filtersOrdered, steps, userTypes),
  }
}
export const getWordingEmpty = (
  hasSelectedFilters: boolean,
): {
  title: string
  text: string
} => {
  if (hasSelectedFilters) {
    return {
      title: 'participant.list.help.title.no.search.result',
      text: 'participant.list.help.text.no.search.result',
    }
  }

  return {
    title: 'empty.section.no.participant',
    text: 'help.text.participant.type.shown',
  }
}
export const getDifferenceFilters = (filters: $PropertyType<ProjectAdminParticipantState, 'filters'>): boolean => {
  const filtersFormatted = {
    type: filters.type,
    step: filters.step,
  }
  const defaultFilters = {
    type: DEFAULT_FILTERS.type,
    step: DEFAULT_FILTERS.step,
  }
  return !isEqual(defaultFilters, filtersFormatted)
}
