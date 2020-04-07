// @flow
import uniqBy from 'lodash/uniqBy';
import type { Uuid } from '~/types';
import type {
  UserSearchDropdownChoice_user,
  UserSearchDropdownChoice_user$ref,
} from '~relay/UserSearchDropdownChoice_user.graphql';
import type { ProjectAdminAnalysis_project } from '~relay/ProjectAdminAnalysis_project.graphql';

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

type Supervisor = {|
  +id: string,
  +$fragmentRefs: UserSearchDropdownChoice_user$ref,
|};

const SHOWING_STEP_TYPENAME = ['CollectStep', 'SelectionStep'];

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

export const isRowIndeterminate = (
  user: UserSearchDropdownChoice_user,
  project: ProjectAdminAnalysis_project,
  proposalIds: $ReadOnlyArray<Uuid>,
): boolean => {
  const entries = Object.entries(
    proposalIds.reduce((acc, id) => {
      acc[id] =
        project.firstAnalysisStep?.proposals.edges?.find(edge => edge?.node.id === id)?.node
          .supervisor || null;
      return acc;
    }, {}),
  );
  const selectedSupervisorsByProposals = getSelectedSupervisorsByProposals(project, proposalIds);
  const userIds = selectedSupervisorsByProposals.map(u => u.id);
  const entriesIds = entries.filter(e => e[1] !== null).map(e => ((e[1]: any): Supervisor).id);
  if (userIds.includes(user.id)) {
    for (const userId of userIds) {
      if (entriesIds.includes(userId)) {
        return !entriesIds.every(eid => eid === userId);
      }
    }
  }

  return false;
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
