import { $PropertyType } from 'utility-types'
import uniqBy from 'lodash/uniqBy'
import isEqual from 'lodash/isEqual'
import type { IntlShape } from 'react-intl'
import type {
  UserSearchDropdownChoice_user,
  UserSearchDropdownChoice_user$ref,
} from '~relay/UserSearchDropdownChoice_user.graphql'
import type { Uuid } from '~/types'
import type { AnalysisDashboardHeader_project } from '~relay/AnalysisDashboardHeader_project.graphql'
import type { AnalysisProjectPageState } from './AnalysisProjectPage.reducer'
import { DEFAULT_FILTERS } from './AnalysisProjectPage.reducer'
import type { User } from '~/components/Analysis/AnalysisFilter/AnalysisFilterRole'
import type { CategoryFilter } from '~/components/Analysis/AnalysisFilter/AnalysisFilterCategory'
import type { DistrictFilter } from '~/components/Analysis/AnalysisFilter/AnalysisFilterDistrict'
import { PROPOSAL_STATUS, TYPE_ACTION, SHOWING_STEP_TYPENAME } from '~/constants/AnalyseConstants'
import {
  getStatus as getStatusAnalyst,
  getHeadStatus as getStatus,
} from '~/components/Analysis/UserAnalystList/UserAnalyst.utils'
import type { AnalysisIndexPageQueryResponse } from '~relay/AnalysisIndexPageQuery.graphql'
import type { ThemeFilter } from '~/components/Analysis/AnalysisFilter/AnalysisFilterTheme'
import type { AnalysisProjectPage_project } from '~relay/AnalysisProjectPage_project.graphql'
import type { AnalysisDashboardHeader_themes } from '~relay/AnalysisDashboardHeader_themes.graphql'
import type { ProjectAdminAnalysis_themes } from '~relay/ProjectAdminAnalysis_themes.graphql'
type ProjectWithAllSteps = {
  readonly steps: ReadonlyArray<{
    readonly id: string
    readonly __typename: string
    readonly form?:
      | {
          readonly usingThemes?: boolean
          readonly districts: ReadonlyArray<{
            readonly id: string
            readonly name: string | null | undefined
          }>
          readonly categories: ReadonlyArray<{
            readonly id: string
            readonly name: string
          }>
          readonly canContact?: boolean
        }
      | null
      | undefined
    readonly proposals?: {
      readonly totalCount: number
      readonly edges:
        | ReadonlyArray<
            | {
                readonly node: {
                  readonly id: string
                }
              }
            | null
            | undefined
          >
        | null
        | undefined
    }
  }>
}
type FilterOrderedFormatted = {
  readonly id: Uuid
  readonly name: string
  readonly type:
    | 'category'
    | 'district'
    | 'theme'
    | 'step'
    | 'status'
    | 'progressState'
    | 'analysts'
    | 'supervisor'
    | 'decisionMaker'
  readonly action?: string
  readonly icon?: string
  readonly color?: string | null | undefined
}
type AllFormattedChoicesReturn = {
  readonly categories: ReadonlyArray<CategoryFilter>
  readonly districts: ReadonlyArray<DistrictFilter>
  readonly filtersOrdered: ReadonlyArray<FilterOrderedFormatted>
}
export type Supervisor = {
  readonly id: string
  readonly username: string
  readonly $fragmentRefs: UserSearchDropdownChoice_user$ref
}
export type Analyst = {
  readonly id: string
  readonly username: string
  readonly $fragmentRefs: UserSearchDropdownChoice_user$ref
}
type RoleUser = {
  isAnalyst: boolean
  isSupervisor: boolean
  isDecisionMaker: boolean
}
export type RowType = 'analyst' | 'supervisor' | 'decision-maker'
export type AllUserAssigned = {
  analysts: User[]
  supervisors: User[]
  decisionMakers: User[]
}
export const getSelectedSupervisorsByProposals = (
  project: AnalysisDashboardHeader_project,
  proposalIds: ReadonlyArray<Uuid>,
): ReadonlyArray<Supervisor> => {
  const entries = Object.entries(
    proposalIds.reduce((acc, id) => {
      acc[id] = project?.proposals.edges?.find(edge => edge?.node.id === id)?.node.supervisor || null
      return acc
    }, {}),
  )
  return uniqBy(
    entries.filter(e => !!e[1]).map(e => e[1]),
    'id',
  ) as any as ReadonlyArray<Supervisor>
}
export const getSelectedAnalystsByProposals = (
  project: AnalysisDashboardHeader_project,
  proposalIds: ReadonlyArray<Uuid>,
): ReadonlyArray<Analyst> => {
  const entries = Object.entries(
    proposalIds.reduce((acc, id) => {
      acc[id] = project?.proposals.edges?.find(edge => edge?.node.id === id)?.node.analysts || []
      return acc
    }, {}),
  )
  return uniqBy(
    entries
      .filter(e => (e[1] as any as ReadonlyArray<Analyst>).length > 0)
      .map(e => e[1])
      .flat(),
    'id',
  ) as any as ReadonlyArray<Analyst>
}
export const isRowIndeterminate = (
  user: UserSearchDropdownChoice_user,
  project: AnalysisDashboardHeader_project,
  selectedProposals: ReadonlyArray<Uuid>,
  type: RowType,
): boolean => {
  const proposals = project?.proposals.edges?.filter(Boolean).map(edge => edge.node)
  const onlySelectedProposals = proposals?.filter(({ id }) => selectedProposals.includes(id)) || []
  const countProposalSelected = onlySelectedProposals.length
  const allDataProposals = onlySelectedProposals.reduce(
    (acc, proposal) => ({
      analysts: proposal.analysts ? [...acc.analysts, ...proposal.analysts] : acc.analysts,
      supervisor: proposal.supervisor ? [...acc.supervisor, proposal.supervisor] : acc.supervisor,
      decisionMaker: proposal.decisionMaker ? [...acc.decisionMaker, proposal.decisionMaker] : acc.decisionMaker,
    }),
    {
      analysts: [],
      supervisor: [],
      decisionMaker: [],
    },
  )
  const countAnalystsSelected = allDataProposals.analysts.filter(({ id }) => id === user.id).length
  const countSupervisorsSelected = allDataProposals.supervisor.filter(({ id }) => id === user.id).length
  const countDecisionMakersSelected = allDataProposals.decisionMaker.filter(({ id }) => id === user.id).length
  const analystsNotInAllSelectedProposals = countAnalystsSelected !== countProposalSelected
  const supervisorsNotInAllSelectedProposals = countSupervisorsSelected !== countProposalSelected
  const decisionMakersNotInAllSelectedProposals = countDecisionMakersSelected !== countProposalSelected

  switch (type) {
    case 'analyst':
      return analystsNotInAllSelectedProposals && countAnalystsSelected !== 0

    case 'supervisor':
      return supervisorsNotInAllSelectedProposals && countSupervisorsSelected !== 0

    case 'decision-maker':
      return decisionMakersNotInAllSelectedProposals && countDecisionMakersSelected !== 0

    default:
      return false
  }
}
export const getCommonSupervisorIdWithinProposalIds = (
  project: AnalysisDashboardHeader_project,
  proposalIds: ReadonlyArray<Uuid>,
) => {
  const selectedSupervisorsByProposals = getSelectedSupervisorsByProposals(project, proposalIds)
  return selectedSupervisorsByProposals.length === 1 && selectedSupervisorsByProposals[0].id
    ? selectedSupervisorsByProposals[0].id
    : null
}
export const getCommonAnalystIdsWithinProposalIds = (
  project: AnalysisDashboardHeader_project,
  proposalIds: ReadonlyArray<Uuid>,
): ReadonlyArray<Uuid> => {
  const selectedAnalystsByProposals = getSelectedAnalystsByProposals(project, proposalIds)
  return selectedAnalystsByProposals.map(analyst => analyst.id)
}
export const getFormattedCategoriesChoicesForProject = (
  project: ProjectWithAllSteps,
): ReadonlyArray<DistrictFilter> => {
  const flattened = project.steps
    .filter(Boolean)
    .filter(step => SHOWING_STEP_TYPENAME.includes(step.__typename))
    .reduce(
      (acc, step) => [
        ...acc, // Flow does not know the type of step in runtime unless we put a bunch of
        // if conditions. For code readability, it is preferable to put here the @ts-expect-error
        // here, but in the end I force cast it to `$ReadOnlyArray<CategoryFilter>`
        step.form.categories.map(cat => ({
          id: cat.id,
          name: cat.name,
        })),
      ],
      [],
    )
    .flat() as any as ReadonlyArray<CategoryFilter>
  return uniqBy(flattened, 'id')
}
export const getFormattedDistrictsChoicesForProject = (project: ProjectWithAllSteps): ReadonlyArray<DistrictFilter> => {
  const flattened = project.steps
    .filter(Boolean)
    .filter(step => SHOWING_STEP_TYPENAME.includes(step.__typename))
    .reduce(
      (acc, step) => [
        ...acc,
        step.form.districts.map(district => ({
          id: district.id,
          name: district.name,
        })),
      ],
      [],
    )
    .flat() as any as ReadonlyArray<CategoryFilter>
  return uniqBy(flattened, 'id')
}
export const getFormattedProposalsWithTheme = (project: AnalysisProjectPage_project): ReadonlyArray<string> => {
  if (project.sortedProposals.totalCount === 0) return []
  const proposals = project.sortedProposals?.edges?.filter(Boolean).map(edge => edge.node)
  const stepsWithThemeEnabled = project.steps
    .filter(Boolean)
    .filter(step => SHOWING_STEP_TYPENAME.includes(step.__typename) && step.form?.usingThemes)
    .map(step => step.id)
  return proposals?.reduce((acc, proposal) => {
    if (stepsWithThemeEnabled.includes(proposal?.form?.step?.id)) {
      return [...acc, proposal.id]
    }

    return acc
  }, []) as any as ReadonlyArray<string>
}

const getFormattedFiltersOrdered = (
  filtersOrdered: $PropertyType<AnalysisProjectPageState, 'filtersOrdered'>,
  categories: ReadonlyArray<CategoryFilter>,
  districts: ReadonlyArray<DistrictFilter>,
  themes: AnalysisDashboardHeader_themes | ProjectAdminAnalysis_themes,
  intl: IntlShape,
): ReadonlyArray<FilterOrderedFormatted> => {
  return filtersOrdered
    .map(filter => {
      if (filter.id === 'ALL' || filter.id === 'NONE') {
        return false
      }

      if (filter.type === 'category') {
        const category = categories.find(({ id }) => id === filter.id) as any as CategoryFilter
        return { ...category, type: 'category', action: 'CLEAR_CATEGORY_FILTER', icon: 'tag' }
      }

      if (filter.type === 'district') {
        const district = districts.find(({ id }) => id === filter.id) as any as DistrictFilter
        return { ...district, type: 'district', action: 'CLEAR_DISTRICT_FILTER', icon: 'pin' }
      }

      if (filter.type === 'theme' && themes?.length > 0) {
        const theme = themes.find(({ id }) => id === filter.id) as any as ThemeFilter
        return {
          id: theme.id,
          name: theme.title,
          type: 'theme',
          action: 'CLEAR_THEME_FILTER',
          icon: 'bookmark2',
        }
      }

      if (filter.type === 'progressState') {
        const progressState = PROPOSAL_STATUS[filter.id]
        return {
          id: filter.id,
          name: intl.formatMessage({
            id: progressState.label,
          }),
          color: progressState.color,
          type: 'progressState',
          icon: progressState.icon,
          action: 'CLEAR_PROGRESS_STATE_FILTER',
        }
      }

      if (filter.type === 'analysts') {
        if (!filter.id) return null
        return {
          id: 'analysts',
          name: intl.formatMessage({
            id: 'tag.filter.analysis',
          }),
          type: 'analysts',
          action: 'CLEAR_ANALYSTS_FILTER',
        }
      }

      if (filter.type === 'supervisor') {
        if (!filter.id) return null
        return {
          id: 'supervisor',
          name: intl.formatMessage({
            id: 'tag.filter.opinion',
          }),
          type: 'supervisor',
          action: 'CLEAR_SUPERVISOR_FILTER',
        }
      }

      if (filter.type === 'decisionMaker') {
        if (!filter.id) return null
        return {
          id: 'decisionMaker',
          name: intl.formatMessage({
            id: 'tag.filter.decision',
          }),
          type: 'decisionMaker',
          action: 'CLEAR_DECISION_MAKER_FILTER',
        }
      }
    })
    .filter(Boolean) as any as ReadonlyArray<FilterOrderedFormatted>
}

export const getAllFormattedChoicesForProject = (
  project: ProjectWithAllSteps,
  filtersOrdered: $PropertyType<AnalysisProjectPageState, 'filtersOrdered'>,
  intl: IntlShape,
  themes: AnalysisDashboardHeader_themes | ProjectAdminAnalysis_themes,
): AllFormattedChoicesReturn => {
  const categories = getFormattedCategoriesChoicesForProject(project)
  const districts = getFormattedDistrictsChoicesForProject(project)
  return {
    categories,
    districts,
    filtersOrdered: getFormattedFiltersOrdered(filtersOrdered, categories, districts, themes, intl),
  }
}
export const getActionShown = (roleUser: RoleUser, idUser: Uuid, selectedProposals: ReadonlyArray<Uuid>): string[] => {
  const { ANALYST, SUPERVISOR } = TYPE_ACTION

  if (selectedProposals.length === 0) {
    // all actions
    return Object.values(TYPE_ACTION) as any as string[]
  }

  const isOnlyDecisionMaker = roleUser.isDecisionMaker && !roleUser.isAnalyst && !roleUser.isSupervisor
  const canAssignAnalyst = roleUser.isAnalyst || roleUser.isSupervisor
  // add only action allowed
  return [...(canAssignAnalyst ? [ANALYST] : []), ...(isOnlyDecisionMaker ? [ANALYST, SUPERVISOR] : [])]
}
export const getAllUserAssigned = (project: AnalysisDashboardHeader_project): AllUserAssigned => {
  const allUserAssigned = project?.proposals.edges
    ?.filter(Boolean)
    .map(edge => edge.node)
    .reduce(
      (acc, proposal) => ({
        analysts:
          proposal.analysts && proposal.analysts.length > 0 ? [...acc.analysts, ...proposal.analysts] : acc.analysts,
        supervisors: proposal.supervisor ? [...acc.supervisors, proposal.supervisor] : acc.supervisors,
        decisionMakers: proposal.decisionMaker ? [...acc.decisionMakers, proposal.decisionMaker] : acc.decisionMakers,
      }),
      {
        analysts: [],
        supervisors: [],
        decisionMakers: [],
      },
    ) as any as AllUserAssigned
  return {
    analysts: uniqBy(allUserAssigned.analysts, 'id'),
    supervisors: uniqBy(allUserAssigned.supervisors, 'id'),
    decisionMakers: uniqBy(allUserAssigned.decisionMakers, 'id'),
  }
}
export const getDifferenceFilters = (filters: $PropertyType<AnalysisProjectPageState, 'filters'>): boolean =>
  !isEqual(filters, DEFAULT_FILTERS)
export const getWordingEmpty = (
  hasSelectedFilters: boolean,
  filters: $PropertyType<AnalysisProjectPageState, 'filters'>,
) => {
  if (hasSelectedFilters) return 'proposition.list.help.text.no.search.result'

  switch (filters.state) {
    case 'DONE':
      return 'help.text.no.proposition.analysed'

    case 'TODO':
      return 'help.text.all.proposition.analysed'

    default:
      return ''
  }
}
export const getUsersWithAnalyseBegin = (
  project: AnalysisDashboardHeader_project,
  selectedProposals: ReadonlyArray<Uuid>,
): {
  analysts: ReadonlyArray<Analyst>
  supervisors: ReadonlyArray<Supervisor>
} => {
  const proposals = project?.proposals.edges?.filter(Boolean).map(edge => edge.node) || []
  const onlySelectedProposals = proposals?.filter(({ id }) => selectedProposals.includes(id))
  const analystsSelectedProposal = getSelectedAnalystsByProposals(project, selectedProposals)
  const supervisorsSelectedProposal = getSelectedSupervisorsByProposals(project, selectedProposals)
  return onlySelectedProposals.reduce(
    (acc, proposal) => {
      const assessmentStatus = getStatus(proposal.assessment)
      const decisionStatus = getStatus(proposal.decision)

      if (analystsSelectedProposal.length > 0) {
        const analystsSelected = analystsSelectedProposal.filter(analyst => {
          const isAnalyst = proposal.analysts?.some(({ id }) => id === analyst.id)
          const analyseStatus = getStatusAnalyst(proposal.analyses, analyst.id, decisionStatus, assessmentStatus)

          if (isAnalyst && analyseStatus.name !== PROPOSAL_STATUS.TODO.name) {
            return analyst
          }
        }) as any as ReadonlyArray<Analyst>

        if (analystsSelected.length > 0) {
          acc.analysts = [...acc.analysts, ...analystsSelected]
        }
      }

      if (supervisorsSelectedProposal.length > 0) {
        const supervisorSelected = supervisorsSelectedProposal.find(
          ({ id }) => id === proposal.supervisor?.id,
        ) as any as Supervisor

        if (assessmentStatus.name !== PROPOSAL_STATUS.TODO.name) {
          acc.supervisors.push(supervisorSelected)
        }
      }

      return acc
    },
    {
      analysts: [],
      supervisors: [],
    },
  )
}
export const getRoleUser = (
  project: AnalysisDashboardHeader_project,
  selectedProposals: ReadonlyArray<Uuid>,
  idUser: Uuid,
): RoleUser => {
  const proposals = project?.proposals.edges?.filter(Boolean).map(edge => edge.node) || []
  const onlySelectedProposals = proposals?.filter(({ id }) => selectedProposals.includes(id))
  return onlySelectedProposals.reduce(
    (acc, proposal) => {
      const isUserAnalyst =
        proposal.analysts && proposal.analysts.length > 0
          ? proposal.analysts?.some(analyst => analyst.id === idUser)
          : false
      const isUserSupervisor = proposal.supervisor ? proposal.supervisor.id === idUser : false
      const isUserDecisionMaker = proposal.decisionMaker ? proposal.decisionMaker.id === idUser : false

      if (isUserAnalyst && acc.isAnalyst !== true) {
        return { ...acc, isAnalyst: true }
      }

      if (isUserSupervisor && acc.isSupervisor !== true) {
        return { ...acc, isSupervisor: true }
      }

      if (isUserDecisionMaker && acc.isDecisionMaker !== true) {
        return { ...acc, isDecisionMaker: true }
      }

      return acc
    },
    {
      isAnalyst: false,
      isSupervisor: false,
      isDecisionMaker: false,
    },
  )
}
export const isOnlyAnalyst = (role: RoleUser) => role.isAnalyst && !role.isSupervisor && !role.isDecisionMaker
export const formatDefaultUsers = (
  defaultUsers: $PropertyType<AnalysisIndexPageQueryResponse, 'defaultUsers'>,
  selectedUsersByProposals: ReadonlyArray<Analyst | Supervisor>,
) => {
  const defaultUsersCleaned =
    defaultUsers?.edges
      ?.filter(Boolean)
      .map(e => e.node)
      .filter(Boolean)
      .filter(user => !selectedUsersByProposals.some(u => u.id === user.id))
      .slice(0, 5) || []
  const selectedUsersByProposalsSorted = [...selectedUsersByProposals].sort((userA, userB) =>
    userA.username.localeCompare(userB.username),
  )
  return [...defaultUsersCleaned, ...selectedUsersByProposalsSorted]
}
