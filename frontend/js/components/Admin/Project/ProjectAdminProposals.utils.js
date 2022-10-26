// @flow
import type { IntlShape } from 'react-intl';
import uniqBy from 'lodash/uniqBy';
import isEqual from 'lodash/isEqual';
import type { ProjectAdminProposals_project } from '~relay/ProjectAdminProposals_project.graphql';
import type { ProjectAdminProposals_themes } from '~relay/ProjectAdminProposals_themes.graphql';
import type { Uuid } from '~/types';
import {
  DEFAULT_FILTERS,
  type ProjectAdminPageState,
  type ProposalsStepValues,
} from './ProjectAdminPage.reducer';
import type {
  UserSearchDropdownChoice_user,
  UserSearchDropdownChoice_user$ref,
} from '~relay/UserSearchDropdownChoice_user.graphql';
import type { ModalConfirmRevokement_analystsWithAnalyseBegin } from '~relay/ModalConfirmRevokement_analystsWithAnalyseBegin.graphql';
import type { ProjectAdminAnalysis_project } from '~relay/ProjectAdminAnalysis_project.graphql';
import {
  type RowType,
  type AllUserAssigned,
} from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.utils';
import {
  getStatus as getStatusAnalyst,
  getHeadStatus as getStatus,
} from '~/components/Analysis/UserAnalystList/UserAnalyst.utils';
import { PROPOSAL_STATUS, SHOWING_STEP_TYPENAME } from '~/constants/AnalyseConstants';
import type { CategoryFilter } from '~/components/Analysis/AnalysisFilter/AnalysisFilterCategory';
import type { DistrictFilter } from '~/components/Analysis/AnalysisFilter/AnalysisFilterDistrict';
import type { ProjectAdminAnalysisTabQueryResponse } from '~relay/ProjectAdminAnalysisTabQuery.graphql';
import type { ThemeFilter } from '~/components/Analysis/AnalysisFilter/AnalysisFilterTheme';

export type StepStatusFilter = {|
  +id: Uuid,
  +color: ?string,
  +name: string,
|};

export type StepFilter = {|
  +id: Uuid,
  +title: string,
  +hasTheme: boolean,
  +type: string,
  +votesRanking: boolean,
  +votable: boolean,
  +form: {
    id: Uuid,
    objectType: string,
  },
  +label: string,
|};

export type CategoryOrStepFilter = {|
  +id: Uuid,
  +name: string,
  +isStep?: boolean,
|};

export type DistrictOrStepFilter = {|
  +id: Uuid,
  +name: string,
  +isStep?: boolean,
|};

type FilterOrderedFormatted = {|
  +id: Uuid,
  +name: string,
  +type: 'category' | 'district' | 'step' | 'status',
  +action?: string,
  +icon?: string,
  +color?: ?string,
  +isShow: boolean,
|};

export type Analyst = {|
  +id: string,
  +username: string,
  +analystsWithAnalyseBegin: ModalConfirmRevokement_analystsWithAnalyseBegin,
  +$fragmentRefs: UserSearchDropdownChoice_user$ref,
|};

export type Supervisor = {|
  +id: string,
  +username: string,
  +$fragmentRefs: UserSearchDropdownChoice_user$ref,
  +analystsWithAnalyseBegin: ModalConfirmRevokement_analystsWithAnalyseBegin,
|};

export type DecisionMaker = {|
  +id: string,
  +username: string,
  +$fragmentRefs: UserSearchDropdownChoice_user$ref,
  +analystsWithAnalyseBegin: ModalConfirmRevokement_analystsWithAnalyseBegin,
|};

export const getFormattedAllCategoriesForProject = (
  project: ProjectAdminProposals_project,
): $ReadOnlyArray<CategoryFilter> => {
  const flattened = ((project.steps
    .filter(Boolean)
    .filter(step => SHOWING_STEP_TYPENAME.includes(step.__typename))
    .reduce(
      (acc, step) => [
        ...acc,
        // Flow does not know the type of step in runtime unless we put a bunch of
        // if conditions. For code readability, it is preferable to put here the $FlowFixMe
        // here, but in the end I force cast it to `$ReadOnlyArray<CategoryFilter>`
        // $FlowFixMe
        step.form.categories.map(cat => ({
          id: cat.id,
          name: cat.name,
        })),
      ],
      [],
    )
    .flat(): any): $ReadOnlyArray<CategoryFilter>);

  return uniqBy(flattened, 'id');
};

export const getFormattedCategoriesChoicesForStep = (
  project: ProjectAdminProposals_project,
  stepId: ?Uuid,
): $ReadOnlyArray<CategoryFilter> => {
  return stepId
    ? ((project.steps
        .filter(Boolean)
        .filter(step => step.id === stepId)
        .reduce(
          (acc, step) => [
            ...acc,
            // Flow does not know the type of step in runtime unless we put a bunch of
            // if conditions. For code readability, it is preferable to put here the $FlowFixMe
            // here, but in the end I force cast it to `$ReadOnlyArray<CategoryFilter>`
            // $FlowFixMe
            step.form.categories.map(cat => ({
              id: cat.id,
              name: cat.name,
            })),
          ],
          [],
        )
        .flat(): any): $ReadOnlyArray<CategoryFilter>)
    : [];
};

export const getFormattedAllDistrictsForProject = (
  project: ProjectAdminProposals_project,
): $ReadOnlyArray<DistrictFilter> => {
  const flattened = ((project.steps
    .filter(Boolean)
    .filter(step => SHOWING_STEP_TYPENAME.includes(step.__typename))
    .reduce(
      (acc, step) => [
        ...acc,
        // Flow does not know the type of step in runtime unless we put a bunch of
        // if conditions. For code readability, it is preferable to put here the $FlowFixMe
        // here, but in the end I force cast it to `$ReadOnlyArray<DistrictFilter>`
        // $FlowFixMe
        step.form.districts.map(district => ({
          id: district.id,
          name: district.name,
        })),
      ],
      [],
    )
    .flat(): any): $ReadOnlyArray<DistrictFilter>);

  return uniqBy(flattened, 'id');
};

export const getFormattedDistrictsChoicesForStep = (
  project: ProjectAdminProposals_project,
  stepId: ?Uuid,
): $ReadOnlyArray<DistrictFilter> => {
  return stepId
    ? ((project.steps
        .filter(Boolean)
        .filter(step => step.id === stepId)
        .reduce(
          (acc, step) => [
            ...acc,
            // $FlowFixMe
            step.form.districts.map(district => ({
              id: district.id,
              name: district.name,
            })),
          ],
          [],
        )
        .flat(): any): $ReadOnlyArray<DistrictFilter>)
    : [];
};

export const getFormattedDistrictsWithStepChoicesForProject = (
  project: ProjectAdminProposals_project,
): $ReadOnlyArray<DistrictOrStepFilter> => {
  return project.steps
    .filter(Boolean)
    .filter(step => SHOWING_STEP_TYPENAME.includes(step.__typename))
    .reduce((acc, step) => {
      if (
        step.__typename === 'CollectStep' &&
        step.form?.districts &&
        step.form.districts.length > 0
      ) {
        acc = [
          ...acc,
          {
            id: step.id,
            name: step.title,
            isStep: true,
          },
          ...(step.form?.districts
            ? step.form.districts.map(district => ({
                id: district.id,
                name: district.name,
              }))
            : []),
        ];
      }

      return acc;
    }, []);
};

export const getFormattedCategoriesWithStepChoicesForProject = (
  project: ProjectAdminProposals_project,
): $ReadOnlyArray<CategoryOrStepFilter> => {
  return project.steps
    .filter(Boolean)
    .filter(step => SHOWING_STEP_TYPENAME.includes(step.__typename))
    .reduce((acc, step) => {
      if (
        step.__typename === 'CollectStep' &&
        step.form?.categories &&
        step.form.categories.length > 0
      ) {
        acc = [
          ...acc,
          {
            id: step.id,
            name: step.title,
            isStep: true,
          },
          ...(step.form?.categories
            ? step.form.categories.map(category => ({
                id: category.id,
                name: category.name,
              }))
            : []),
        ];
      }

      return acc;
    }, [])
    .filter(Boolean);
};

export const getFormattedStepsChoicesForProject = (
  project: ProjectAdminProposals_project,
): $ReadOnlyArray<StepFilter> => {
  return ((project.steps
    .filter(Boolean)
    .filter(step => SHOWING_STEP_TYPENAME.includes(step.__typename))
    .map(step => ({
      id: step.id,
      title: step.title,
      hasTheme: step.form?.usingThemes,
      votesRanking: step.votesRanking || false,
      votable: step.votable || false,
      type: step.__typename,
      form: step.form,
      label: step.label,
    })): any): $ReadOnlyArray<StepFilter>);
};

export const getFormattedCollectStepsForProject = (
  project: ProjectAdminProposals_project,
): $ReadOnlyArray<Uuid> => {
  return ((project.steps
    .filter(Boolean)
    .filter(step => step.__typename === 'CollectStep')
    .map(step => step.id): any): $ReadOnlyArray<Uuid>);
};

export const getFormattedStatusesChoicesForProjectStep = (
  project: ProjectAdminProposals_project,
  stepId: ?Uuid,
): $ReadOnlyArray<StepStatusFilter> => {
  return ((project.steps
    .filter(Boolean)
    .filter(step => SHOWING_STEP_TYPENAME.includes(step.__typename))
    .filter(step => stepId && step.id === stepId)
    .filter(step => step.statuses && step.statuses.length > 0)
    .reduce(
      (acc, step) => [
        ...acc,
        // $FlowFixMe,
        step.statuses?.map(status => ({
          id: status.id,
          name: status.name,
          color: status.color,
        })),
      ],
      [],
    )
    .flat(): any): $ReadOnlyArray<StepStatusFilter>);
};

type AllFormattedChoicesReturn = {|
  +categories: $ReadOnlyArray<CategoryFilter>,
  +categoriesWithStep: $ReadOnlyArray<CategoryOrStepFilter>,
  +districts: $ReadOnlyArray<DistrictFilter>,
  +districtsWithStep: $ReadOnlyArray<DistrictOrStepFilter>,
  +steps: $ReadOnlyArray<StepFilter>,
  +stepStatuses: $ReadOnlyArray<StepStatusFilter>,
  +filtersOrdered: $ReadOnlyArray<FilterOrderedFormatted>,
|};

const getFormattedFiltersOrdered = (
  filtersOrdered: $PropertyType<ProjectAdminPageState, 'filtersOrdered'>,
  categories: $ReadOnlyArray<CategoryFilter>,
  districts: $ReadOnlyArray<DistrictFilter>,
  steps: $ReadOnlyArray<StepFilter>,
  stepStatuses: $ReadOnlyArray<StepStatusFilter>,
  themes: ProjectAdminProposals_themes = [],
  intl: IntlShape,
): $ReadOnlyArray<FilterOrderedFormatted> => {
  return ((filtersOrdered
    .map(filter => {
      if (filter.id === 'ALL' || filter.id === 'NONE') {
        return false;
      }

      if (filter.type === 'category') {
        const category = ((categories.find(({ id }) => id === filter.id): any): CategoryFilter);
        return {
          ...category,
          type: 'category',
          action: 'CLEAR_CATEGORY_FILTER',
          icon: 'tag',
        };
      }

      if (filter.type === 'district') {
        const district = ((districts.find(({ id }) => id === filter.id): any): DistrictFilter);
        return {
          ...district,
          type: 'district',
          action: 'CLEAR_DISTRICT_FILTER',
          icon: 'pin',
        };
      }

      if (filter.type === 'theme' && themes?.length > 0) {
        const theme = ((themes.find(({ id }) => id === filter.id): any): ThemeFilter);

        return {
          id: theme.id,
          name: theme.title,
          type: 'theme',
          action: 'CLEAR_THEME_FILTER',
          icon: 'bookmark2',
        };
      }

      if (filter.type === 'status') {
        const status = ((stepStatuses.find(({ id }) => id === filter.id): any): StepStatusFilter);
        return {
          ...status,
          type: 'status',
          action: 'CLEAR_STATUS_FILTER',
        };
      }

      if (filter.type === 'step') {
        const step = ((steps.find(({ id }) => id === filter.id): any): StepFilter);
        if (!step) return null;
        return {
          id: step.id,
          name: step.title,
          type: 'step',
          icon: 'stack',
        };
      }

      if (filter.type === 'analysts') {
        if (!filter.id) return null;

        return {
          id: 'analysts',
          name: intl.formatMessage({ id: 'tag.filter.analysis' }),
          type: 'analysts',
          action: 'CLEAR_ANALYSTS_FILTER',
        };
      }

      if (filter.type === 'supervisor') {
        if (!filter.id) return null;

        return {
          id: 'supervisor',
          name: intl.formatMessage({ id: 'tag.filter.opinion' }),
          type: 'supervisor',
          action: 'CLEAR_SUPERVISOR_FILTER',
        };
      }

      if (filter.type === 'decisionMaker') {
        if (!filter.id) return null;

        return {
          id: 'decisionMaker',
          name: intl.formatMessage({ id: 'tag.filter.decision' }),
          type: 'decisionMaker',
          action: 'CLEAR_DECISION_MAKER_FILTER',
        };
      }
    })
    .filter(Boolean): any): $ReadOnlyArray<FilterOrderedFormatted>);
};

export const getAllFormattedChoicesForProject = (
  project: ProjectAdminProposals_project,
  stepId: ?Uuid,
  selectedRows: string[],
  filtersOrdered: $PropertyType<ProjectAdminPageState, 'filtersOrdered'>,
  intl: IntlShape,
  themes: ProjectAdminProposals_themes,
): AllFormattedChoicesReturn => {
  const allCategories = getFormattedAllCategoriesForProject(project);
  const categoriesOfStep = getFormattedCategoriesChoicesForStep(project, stepId);
  const categoriesWithStep = getFormattedCategoriesWithStepChoicesForProject(project);

  const allDistricts = getFormattedAllDistrictsForProject(project);
  const districtsOfStep = getFormattedDistrictsChoicesForStep(project, stepId);
  const districtsWithStep = getFormattedDistrictsWithStepChoicesForProject(project);

  const steps = getFormattedStepsChoicesForProject(project);
  const stepStatuses = getFormattedStatusesChoicesForProjectStep(project, stepId);

  return {
    categories: categoriesOfStep,
    categoriesWithStep,
    districts: districtsOfStep,
    districtsWithStep,
    steps,
    stepStatuses,
    filtersOrdered: getFormattedFiltersOrdered(
      filtersOrdered,
      allCategories,
      allDistricts,
      steps,
      stepStatuses,
      themes,
      intl,
    ),
  };
};

export const getSelectedSupervisorsByProposals = (
  project: ProjectAdminAnalysis_project,
  proposalIds: $ReadOnlyArray<Uuid>,
): $ReadOnlyArray<Supervisor> => {
  const entries = Object.entries(
    proposalIds.reduce((acc, id) => {
      acc[id] =
        project.firstAnalysisStep?.proposals.edges?.find(edge => edge?.node.id === id)?.node
          .supervisor || null;
      return acc;
    }, {}),
  );
  return ((uniqBy(
    entries.filter(e => !!e[1]).map(e => e[1]),
    'id',
  ): any): $ReadOnlyArray<Supervisor>);
};

export const getSelectedDecisionMakersByProposals = (
  project: ProjectAdminAnalysis_project,
  proposalIds: $ReadOnlyArray<Uuid>,
): $ReadOnlyArray<DecisionMaker> => {
  const entries = Object.entries(
    proposalIds.reduce((acc, id) => {
      acc[id] =
        project.firstAnalysisStep?.proposals.edges?.find(edge => edge?.node.id === id)?.node
          .decisionMaker || null;
      return acc;
    }, {}),
  );
  return ((uniqBy(
    entries.filter(e => !!e[1]).map(e => e[1]),
    'id',
  ): any): $ReadOnlyArray<DecisionMaker>);
};

export const getSelectedAnalystsByProposals = (
  project: ProjectAdminAnalysis_project,
  proposalIds: $ReadOnlyArray<Uuid>,
): $ReadOnlyArray<Analyst> => {
  const entries = Object.entries(
    proposalIds.reduce((acc, id) => {
      acc[id] =
        project.firstAnalysisStep?.proposals.edges?.find(edge => edge?.node.id === id)?.node
          .analysts || [];
      return acc;
    }, {}),
  );
  return ((uniqBy(
    entries
      .filter(e => ((e[1]: any): $ReadOnlyArray<Analyst>).length > 0)
      .map(e => e[1])
      .flat(),
    'id',
  ): any): $ReadOnlyArray<Analyst>);
};

export const getSelectedStatusByProposals = (
  project: ProjectAdminProposals_project,
  proposalIds: $ReadOnlyArray<Uuid>,
): $ReadOnlyArray<StepStatusFilter> => {
  const entries = Object.entries(
    proposalIds.reduce((acc, id) => {
      acc[id] = project.proposals.edges?.find(edge => edge?.node.id === id)?.node.status || null;
      return acc;
    }, {}),
  );

  return ((uniqBy(
    entries.filter(e => !!e[1]).map(e => e[1]),
    'id',
  ): any): $ReadOnlyArray<StepStatusFilter>);
};

export const getSelectedStepsByProposals = (
  project: ProjectAdminProposals_project,
  proposalIds: $ReadOnlyArray<Uuid>,
): StepFilter[] => {
  const entries = Object.entries(
    proposalIds.reduce((acc, id) => {
      acc[id] = [
        project.proposals.edges?.find(edge => edge?.node.id === id)?.node.form?.step,
        ...(project.proposals.edges
          ?.find(edge => edge?.node.id === id)
          ?.node.selections?.map(({ step }) => step) || []),
      ];
      return acc;
    }, {}),
  );

  return ((uniqBy(
    entries.filter(e => !!e[1]).map(e => e[1]),
    'id',
  ).flat(): any): StepFilter[]);
};

export const getCommonSupervisorIdWithinProposalIds = (
  project: ProjectAdminAnalysis_project,
  proposalIds: $ReadOnlyArray<Uuid>,
) => {
  const selectedSupervisorsByProposals = getSelectedSupervisorsByProposals(project, proposalIds);

  return selectedSupervisorsByProposals.length === 1 && selectedSupervisorsByProposals[0].id
    ? selectedSupervisorsByProposals[0].id
    : null;
};

export const getCommonDecisionMakerIdWithinProposalIds = (
  project: ProjectAdminAnalysis_project,
  proposalIds: $ReadOnlyArray<Uuid>,
) => {
  const selectedDecisionMakerByProposals = getSelectedDecisionMakersByProposals(
    project,
    proposalIds,
  );

  return selectedDecisionMakerByProposals.length === 1 && selectedDecisionMakerByProposals[0].id
    ? selectedDecisionMakerByProposals[0].id
    : null;
};

export const getCommonAnalystIdsWithinProposalIds = (
  project: ProjectAdminAnalysis_project,
  proposalIds: $ReadOnlyArray<Uuid>,
): $ReadOnlyArray<Uuid> => {
  const selectedAnalystsByProposals = getSelectedAnalystsByProposals(project, proposalIds);

  return selectedAnalystsByProposals.map(analyst => analyst.id);
};

export const getCommonStatusIdWithinProposalIds = (
  project: ProjectAdminProposals_project,
  proposalIds: $ReadOnlyArray<Uuid>,
) => {
  const selectedStatusByProposals = getSelectedStatusByProposals(project, proposalIds);

  return selectedStatusByProposals.length === 1 && selectedStatusByProposals[0].id
    ? selectedStatusByProposals[0].id
    : null;
};

export const getCommonStepIdWithinProposalIds = (
  project: ProjectAdminProposals_project,
  proposalIds: $ReadOnlyArray<Uuid>,
): $ReadOnlyArray<Uuid> => {
  const selectedStepsByProposals = getSelectedStepsByProposals(project, proposalIds);

  return selectedStepsByProposals.map(step => step.id);
};

export const isRowIndeterminate = (
  user: UserSearchDropdownChoice_user,
  project: ProjectAdminAnalysis_project,
  selectedProposals: $ReadOnlyArray<Uuid>,
  type: RowType,
): boolean => {
  const proposals = project.firstAnalysisStep?.proposals.edges
    ?.filter(Boolean)
    .map(edge => edge.node);

  const onlySelectedProposals = proposals?.filter(({ id }) => selectedProposals.includes(id)) || [];
  const countProposalSelected = onlySelectedProposals.length;

  const allDataProposals = onlySelectedProposals.reduce(
    (acc, proposal) => ({
      analysts: proposal.analysts ? [...acc.analysts, ...proposal.analysts] : acc.analysts,
      supervisor: proposal.supervisor ? [...acc.supervisor, proposal.supervisor] : acc.supervisor,
      decisionMaker: proposal.decisionMaker
        ? [...acc.decisionMaker, proposal.decisionMaker]
        : acc.decisionMaker,
    }),
    { analysts: [], supervisor: [], decisionMaker: [] },
  );

  const countAnalystsSelected = allDataProposals.analysts.filter(({ id }) => id === user.id).length;
  const countSupervisorsSelected = allDataProposals.supervisor.filter(
    ({ id }) => id === user.id,
  ).length;
  const countDecisionMakersSelected = allDataProposals.decisionMaker.filter(
    ({ id }) => id === user.id,
  ).length;

  const analystsNotInAllSelectedProposals = countAnalystsSelected !== countProposalSelected;
  const supervisorsNotInAllSelectedProposals = countSupervisorsSelected !== countProposalSelected;
  const decisionMakersNotInAllSelectedProposals =
    countDecisionMakersSelected !== countProposalSelected;

  switch (type) {
    case 'analyst':
      return analystsNotInAllSelectedProposals && countAnalystsSelected !== 0;
    case 'supervisor':
      return supervisorsNotInAllSelectedProposals && countSupervisorsSelected !== 0;
    case 'decision-maker':
      return decisionMakersNotInAllSelectedProposals && countDecisionMakersSelected !== 0;
    default:
      return false;
  }
};

export const isStatusIndeterminate = (
  project: ProjectAdminProposals_project,
  selectedProposals: $ReadOnlyArray<Uuid>,
  statusId: Uuid,
) => {
  const proposals = project.proposals.edges?.filter(Boolean).map(edge => edge.node);

  const onlySelectedProposals = proposals?.filter(({ id }) => selectedProposals.includes(id)) || [];
  const countProposalSelected = onlySelectedProposals.length;

  const countStatusSelected = onlySelectedProposals.filter(
    ({ status }) => status?.id === statusId,
  ).length;

  const statusNotInAllSelectedProposals = countStatusSelected !== countProposalSelected;

  return statusNotInAllSelectedProposals && countStatusSelected !== 0;
};

export const isStepIndeterminate = (
  project: ProjectAdminProposals_project,
  selectedProposals: $ReadOnlyArray<Uuid>,
  stepId: Uuid,
) => {
  const proposals = project.proposals.edges?.filter(Boolean).map(edge => edge.node);

  const onlySelectedProposals = proposals?.filter(({ id }) => selectedProposals.includes(id)) || [];
  const countProposalSelected = onlySelectedProposals.length;

  const countStepSelected = onlySelectedProposals.filter(
    ({ form, selections }) =>
      form?.step?.id === stepId || selections?.some(({ step }) => step.id === stepId),
  ).length;

  const stepsNotInAllSelectedProposals = countStepSelected !== countProposalSelected;

  return stepsNotInAllSelectedProposals && countStepSelected !== 0;
};

export const getDifferenceFilters = (
  filters: $PropertyType<ProjectAdminPageState, 'filters'>,
): boolean => {
  const filtersFormatted = {
    category: filters.category,
    district: filters.district,
    status: filters.status,
    theme: filters.theme,
  };

  const defaultFilters = {
    category: DEFAULT_FILTERS.category,
    district: DEFAULT_FILTERS.district,
    status: DEFAULT_FILTERS.status,
    theme: DEFAULT_FILTERS.theme,
  };

  return !isEqual(defaultFilters, filtersFormatted);
};

export const getDifferenceFiltersAnalysis = (
  filters: $PropertyType<ProjectAdminPageState, 'filters'>,
): boolean => {
  const filtersFormatted = {
    category: filters.category,
    district: filters.district,
    progressState: filters.progressState,
    theme: filters.theme,
  };

  const defaultFilters = {
    category: DEFAULT_FILTERS.category,
    district: DEFAULT_FILTERS.district,
    progressState: DEFAULT_FILTERS.progressState,
    theme: DEFAULT_FILTERS.theme,
  };

  return !isEqual(defaultFilters, filtersFormatted);
};

export const getWordingEmpty = (
  hasSelectedFilters: boolean,
  filters: $PropertyType<ProjectAdminPageState, 'filters'>,
): string => {
  if (hasSelectedFilters) return 'proposition.list.help.text.no.search.result';

  switch (filters.state) {
    case 'ALL':
      return 'help.text.section.all.empty';
    case 'PUBLISHED':
      return 'help.text.section.published.empty';
    case 'DRAFT':
      return 'help.text.section.draft.empty';
    case 'TRASHED':
      return 'help.text.section.bin.empty';
    default:
      return '';
  }
};

export const getAllUserAssigned = (project: ProjectAdminAnalysis_project): AllUserAssigned => {
  const allUserAssigned = ((project.firstAnalysisStep?.proposals.edges
    ?.filter(Boolean)
    .map(edge => edge.node)
    .reduce(
      (acc, proposal) => ({
        analysts:
          proposal.analysts && proposal.analysts.length > 0
            ? [...acc.analysts, ...proposal.analysts]
            : acc.analysts,
        supervisors: proposal.supervisor
          ? [...acc.supervisors, proposal.supervisor]
          : acc.supervisors,
        decisionMakers: proposal.decisionMaker
          ? [...acc.decisionMakers, proposal.decisionMaker]
          : acc.decisionMakers,
      }),
      {
        analysts: [],
        supervisors: [],
        decisionMakers: [],
      },
    ): any): AllUserAssigned);

  return {
    analysts: uniqBy(allUserAssigned.analysts, 'id'),
    supervisors: uniqBy(allUserAssigned.supervisors, 'id'),
    decisionMakers: uniqBy(allUserAssigned.decisionMakers, 'id'),
  };
};

export const getUsersWithAnalyseBegin = (
  project: ProjectAdminAnalysis_project,
  selectedProposals: $ReadOnlyArray<Uuid>,
): {
  analysts: $ReadOnlyArray<Analyst>,
  supervisors: $ReadOnlyArray<Supervisor>,
  decisionMakers: $ReadOnlyArray<DecisionMaker>,
} => {
  const proposals =
    project.firstAnalysisStep?.proposals.edges?.filter(Boolean).map(edge => edge.node) || [];
  const onlySelectedProposals = proposals?.filter(({ id }) => selectedProposals.includes(id));

  const analystsSelectedProposal = getSelectedAnalystsByProposals(project, selectedProposals);
  const supervisorsSelectedProposal = getSelectedSupervisorsByProposals(project, selectedProposals);
  const decisionMakersSelectedProposal = getSelectedDecisionMakersByProposals(
    project,
    selectedProposals,
  );

  return onlySelectedProposals.reduce(
    (acc, proposal) => {
      const decisionStatus = getStatus(proposal.decision, true);
      const assessmentStatus = getStatus(proposal.assessment, false, decisionStatus);

      if (analystsSelectedProposal.length > 0) {
        const analystsSelected = ((analystsSelectedProposal.filter(analyst => {
          const isAnalyst = proposal.analysts?.some(({ id }) => id === analyst.id);
          const analyseStatus = getStatusAnalyst(
            proposal.analyses,
            analyst.id,
            decisionStatus,
            assessmentStatus,
          );

          if (isAnalyst && analyseStatus.name !== PROPOSAL_STATUS.TODO.name) {
            return analyst;
          }
        }): any): $ReadOnlyArray<Analyst>);

        if (analystsSelected.length > 0) {
          acc.analysts = [...acc.analysts, ...analystsSelected];
        }
      }

      if (supervisorsSelectedProposal.length > 0) {
        const supervisorSelected = ((supervisorsSelectedProposal.find(
          ({ id }) => id === proposal.supervisor?.id,
        ): any): Supervisor);

        if (assessmentStatus.name !== PROPOSAL_STATUS.TODO.name) {
          acc.supervisors.push(supervisorSelected);
        }
      }

      if (decisionMakersSelectedProposal.length > 0) {
        const decisionMakerSelected = ((decisionMakersSelectedProposal.find(
          ({ id }) => id === proposal.decisionMaker?.id,
        ): any): DecisionMaker);

        if (decisionStatus.name !== PROPOSAL_STATUS.TODO.name) {
          acc.decisionMakers.push(decisionMakerSelected);
        }
      }

      return acc;
    },
    { analysts: [], supervisors: [], decisionMakers: [] },
  );
};

export const formatDefaultUsers = (
  defaultUsers: $PropertyType<ProjectAdminAnalysisTabQueryResponse, 'defaultUsers'>,
  selectedUsersByProposals: $ReadOnlyArray<Analyst | Supervisor | DecisionMaker>,
) => {
  const defaultUsersCleaned =
    defaultUsers?.edges
      ?.filter(Boolean)
      .map(e => e.node)
      .filter(Boolean)
      .filter(user => !selectedUsersByProposals.some(u => u.id === user.id))
      .slice(0, 5) || [];

  const selectedUsersByProposalsSorted = [...selectedUsersByProposals].sort((userA, userB) =>
    userA.username.localeCompare(userB.username),
  );

  return [...defaultUsersCleaned, ...selectedUsersByProposalsSorted];
};

export const getStepDisplay = (
  project: ProjectAdminProposals_project,
  filterStepId: ProposalsStepValues,
): StepFilter => {
  const proposals = project.proposals.edges?.filter(Boolean).map(edge => edge.node);
  const steps = ((proposals
    ?.map(proposal => [proposal.form?.step, ...proposal.selections?.map(({ step }) => step)])
    .filter(Boolean)
    .flat(): any): StepFilter[]);

  return ((steps.find(step => step?.id === filterStepId): any): StepFilter);
};

export const getFormattedProposalsWithTheme = (
  project: ProjectAdminAnalysis_project,
): $ReadOnlyArray<string> => {
  if (project.firstAnalysisStep?.proposals?.totalCount === 0) return [];

  const proposals = project.firstAnalysisStep?.proposals?.edges
    ?.filter(Boolean)
    .map(edge => edge.node);

  const stepsWithThemeEnabled = project.steps
    .filter(Boolean)
    .filter(step => SHOWING_STEP_TYPENAME.includes(step.__typename) && step.form?.usingThemes)
    .map(step => step.id);

  return ((proposals?.reduce((acc, proposal) => {
    if (stepsWithThemeEnabled.includes(proposal?.form?.step?.id)) {
      return [...acc, proposal.id];
    }

    return acc;
  }, []): any): $ReadOnlyArray<string>);
};
