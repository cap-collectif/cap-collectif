// @flow
import uniqBy from 'lodash/uniqBy';
import lodashFilter from 'lodash/filter';
import type { Uuid } from '~/types';
import type {
  UserSearchDropdownChoice_user,
  UserSearchDropdownChoice_user$ref,
} from '~relay/UserSearchDropdownChoice_user.graphql';
import type { AnalysisDashboardHeader_project } from '~relay/AnalysisDashboardHeader_project.graphql';
import { TYPE_ACTION } from '~/constants/AnalyseConstants';

type ProjectWithAllSteps = {
  +steps: $ReadOnlyArray<{|
    +__typename: string,
    +form?: {|
      +districts: $ReadOnlyArray<{|
        +id: string,
        +name: ?string,
      |}>,
      +categories: $ReadOnlyArray<{|
        +id: string,
        +name: string,
      |}>,
    |},
  |}>,
  ...
};

type DistrictFilter = {|
  +id: Uuid,
  +name: string,
|};

type CategoryFilter = {|
  +id: Uuid,
  +name: string,
|};

type AllFormattedChoicesReturn = {|
  +categories: $ReadOnlyArray<CategoryFilter>,
  +districts: $ReadOnlyArray<DistrictFilter>,
|};

export type Supervisor = {|
  +id: string,
  +$fragmentRefs: UserSearchDropdownChoice_user$ref,
|};

export type Analyst = {|
  +id: string,
  +$fragmentRefs: UserSearchDropdownChoice_user$ref,
|};

export type DecisionMaker = {|
  +id: string,
  +$fragmentRefs: UserSearchDropdownChoice_user$ref,
|};

type User = {|
  +id: string,
  +username: string,
|};

export type RowType = 'analyst' | 'supervisor' | 'decision-maker';

const SHOWING_STEP_TYPENAME = ['CollectStep', 'SelectionStep'];

export const getSelectedSupervisorsByProposals = (
  project: AnalysisDashboardHeader_project,
  proposalIds: $ReadOnlyArray<Uuid>,
): $ReadOnlyArray<Supervisor> => {
  const entries = Object.entries(
    proposalIds.reduce((acc, id) => {
      acc[id] =
        project?.proposals.edges?.find(edge => edge?.node.id === id)?.node.supervisor || null;
      return acc;
    }, {}),
  );
  return ((uniqBy(
    entries.filter(e => !!e[1]).map(e => e[1]),
    'id',
  ): any): $ReadOnlyArray<Supervisor>);
};

export const getSelectedDecisionMakersByProposals = (
  project: AnalysisDashboardHeader_project,
  proposalIds: $ReadOnlyArray<Uuid>,
): $ReadOnlyArray<DecisionMaker> => {
  const entries = Object.entries(
    proposalIds.reduce((acc, id) => {
      acc[id] =
        project?.proposals.edges?.find(edge => edge?.node.id === id)?.node.decisionMaker || null;
      return acc;
    }, {}),
  );
  return ((uniqBy(
    entries.filter(e => !!e[1]).map(e => e[1]),
    'id',
  ): any): $ReadOnlyArray<DecisionMaker>);
};

export const getSelectedAnalystsByProposals = (
  project: AnalysisDashboardHeader_project,
  proposalIds: $ReadOnlyArray<Uuid>,
): $ReadOnlyArray<Analyst> => {
  const entries = Object.entries(
    proposalIds.reduce((acc, id) => {
      acc[id] = project?.proposals.edges?.find(edge => edge?.node.id === id)?.node.analysts || [];
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

const getSelectedEntries = (
  project: AnalysisDashboardHeader_project,
  proposalIds: $ReadOnlyArray<string>,
  type: RowType,
) => {
  switch (type) {
    case 'analyst':
      return getSelectedAnalystsByProposals(project, proposalIds);
    case 'supervisor':
      return getSelectedSupervisorsByProposals(project, proposalIds);
    case 'decision-maker':
      return getSelectedDecisionMakersByProposals(project, proposalIds);
    default:
      throw new Error(`Unknow row type: ${type}`);
  }
};

export const getEntriesIds = (entries: any, type: RowType) => {
  switch (type) {
    case 'analyst':
      return entries
        .filter(e => ((e[1]: any): $ReadOnlyArray<{ id: Uuid }>).length > 0)
        .map(e => ((e[1]: any): $ReadOnlyArray<{ id: Uuid }>))
        .flat()
        .map(u => ((u: any): { id: Uuid }).id);
    case 'supervisor':
    case 'decision-maker':
      return entries.filter(e => e[1] !== null).map(e => ((e[1]: any): { id: Uuid }).id);
    default:
      throw new Error(`Unknow row type: ${type}`);
  }
};

export const isRowIndeterminate = (
  user: UserSearchDropdownChoice_user,
  project: AnalysisDashboardHeader_project,
  proposalIds: $ReadOnlyArray<Uuid>,
  type: RowType,
): boolean => {
  const entries = Object.entries(
    proposalIds.reduce((acc, id) => {
      if (type === 'supervisor') {
        acc[id] =
          project?.proposals.edges?.find(edge => edge?.node.id === id)?.node.supervisor || null;
      } else if (type === 'analyst') {
        acc[id] = project?.proposals.edges?.find(edge => edge?.node.id === id)?.node.analysts || [];
      } else if (type === 'decision-maker') {
        acc[id] =
          project?.proposals.edges?.find(edge => edge?.node.id === id)?.node.decisionMaker || null;
      }
      return acc;
    }, {}),
  );
  const selectedEntries = getSelectedEntries(project, proposalIds, type);
  const userIds = selectedEntries.map(u => u.id);
  const entriesIds = getEntriesIds(entries, type);

  if (userIds.includes(user.id)) {
    for (const userId of userIds) {
      if ((type === 'supervisor' || type === 'decision-maker') && entriesIds.includes(userId)) {
        return !entriesIds.every(eid => eid === userId);
      }
      if (type === 'analyst') {
        const duplicates = lodashFilter(
          entriesIds,
          v => lodashFilter(entriesIds, v1 => v1 === v).length > 1,
        );
        return (
          !!entries.find(e => ((e[1]: any): $ReadOnlyArray<Uuid>).length === 0) ||
          (duplicates.length > 0 &&
            proposalIds.length > duplicates.filter(id => id === user.id).length)
        );
      }
    }
  }

  return false;
};

export const getCommonSupervisorIdWithinProposalIds = (
  project: AnalysisDashboardHeader_project,
  proposalIds: $ReadOnlyArray<Uuid>,
) => {
  const selectedSupervisorsByProposals = getSelectedSupervisorsByProposals(project, proposalIds);

  return selectedSupervisorsByProposals.length === 1 && selectedSupervisorsByProposals[0].id
    ? selectedSupervisorsByProposals[0].id
    : null;
};

export const getCommonDecisionMakerIdWithinProposalIds = (
  project: AnalysisDashboardHeader_project,
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
  project: AnalysisDashboardHeader_project,
  proposalIds: $ReadOnlyArray<Uuid>,
): $ReadOnlyArray<Uuid> => {
  const selectedAnalystsByProposals = getSelectedAnalystsByProposals(project, proposalIds);

  return selectedAnalystsByProposals.map(analyst => analyst.id);
};

export const getFormattedCategoriesChoicesForProject = (
  project: ProjectWithAllSteps,
): $ReadOnlyArray<DistrictFilter> => {
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

export const getFormattedDistrictsChoicesForProject = (
  project: ProjectWithAllSteps,
): $ReadOnlyArray<DistrictFilter> => {
  const flattened = ((project.steps
    .filter(Boolean)
    .filter(step => SHOWING_STEP_TYPENAME.includes(step.__typename))
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
    .flat(): any): $ReadOnlyArray<CategoryFilter>);
  return uniqBy(flattened, 'id');
};

export const getAllFormattedChoicesForProject = (
  project: ProjectWithAllSteps,
): AllFormattedChoicesReturn => ({
  categories: getFormattedCategoriesChoicesForProject(project),
  districts: getFormattedDistrictsChoicesForProject(project),
});

export const getActionShown = (
  proposalIdsSelected: string[] = [],
  userId: string,
  proposals: ?$ReadOnlyArray<Object>,
): string[] => {
  const { ANALYST, SUPERVISOR } = TYPE_ACTION;

  if (proposalIdsSelected.length === 0) {
    // all filters
    return ((Object.values(TYPE_ACTION): any): string[]);
  }

  const proposalsSelected = proposals
    ? proposals.filter(({ id }) => proposalIdsSelected.includes(id))
    : [];

  const userRoles = proposalsSelected.reduce(
    (acc, proposal) => {
      const isUserAnalyst =
        proposal.analysts?.length > 0
          ? proposal.analysts.some(analyst => analyst.id === userId)
          : false;

      const isUserSupervisor = proposal.supervisor ? proposal.supervisor.id === userId : false;

      const isUserDecisionMaker = proposal.decisionMaker
        ? proposal.decisionMaker.id === userId
        : false;

      if (isUserAnalyst && acc.isAnalyst !== true) {
        return {
          ...acc,
          isAnalyst: true,
        };
      }

      if (isUserSupervisor && acc.isSupervisor !== true) {
        return {
          ...acc,
          isSupervisor: true,
        };
      }

      if (isUserDecisionMaker && acc.isDecisionMaker !== true) {
        return {
          ...acc,
          isDecisionMaker: true,
        };
      }

      return acc;
    },
    { isAnalyst: false, isSupervisor: false, isDecisionMaker: false },
  );

  const isOnlyDecisionMaker =
    userRoles.isDecisionMaker && !userRoles.isAnalyst && !userRoles.isSupervisor;
  const canAssignAnalyst = userRoles.isAnalyst || userRoles.isSupervisor;

  // add only filter allowed
  return [
    ...(canAssignAnalyst ? [ANALYST] : []),
    ...(isOnlyDecisionMaker ? [ANALYST, SUPERVISOR] : []),
  ];
};

export const getAllUserAssigned = (project: AnalysisDashboardHeader_project): User[] => {
  const allUserAssigned = project?.proposals.edges
    ?.filter(Boolean)
    .map(edge => edge.node)
    .map(proposal => [...(proposal.analysts || []), proposal.supervisor, proposal.decisionMaker])
    .flat()
    .filter(Boolean);

  return ((uniqBy(allUserAssigned, 'id'): any): User[]);
};

export const getUsersFilteredWithSearch = (
  users: User[] = [],
  searchUsername: ?string = '',
): User[] => {
  if (searchUsername) {
    return ((users
      .filter(({ username }) => username.toLowerCase().includes(searchUsername.toLowerCase()))
      .sort((userA, userB) => userA.username.localeCompare(userB.username))
      .slice(0, 4): any): User[]);
  }

  return ((users
    .sort((userA, userB) => userA.username.localeCompare(userB.username))
    .slice(0, 4): any): User[]);
};
