// @flow
import uniqBy from 'lodash/uniqBy';
import type { ProjectAdminProposals_project } from '~relay/ProjectAdminProposals_project.graphql';
import type { Uuid } from '~/types';

type DistrictFilter = {|
  +id: Uuid,
  +name: string,
|};

type StepStatusFilter = {|
  +id: Uuid,
  +color: ?string,
  +name: string,
|}

type StepFilter = {|
  +id: Uuid,
  +title: string,
|};

type CategoryFilter = {|
  +id: Uuid,
  +name: string,
|};

const SHOWING_STEP_TYPENAME = ['CollectStep', 'SelectionStep'];

export const getFormattedCategoriesChoicesForProject = (
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
  project: ProjectAdminProposals_project,
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

export const getFormattedStepsChoicesForProject = (
  project: ProjectAdminProposals_project,
): $ReadOnlyArray<StepFilter> => {
  return ((project.steps
    .filter(Boolean)
    .filter(step => SHOWING_STEP_TYPENAME.includes(step.__typename))
    .map(step => ({
      id: step.id,
      title: step.title,
    })): any): $ReadOnlyArray<StepFilter>);
};

export const getFormattedStatusesChoicesForProjectStep = (
  project: ProjectAdminProposals_project,
  stepId: ?Uuid
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
        }))
      ],
      [],
    )
    .flat(): any): $ReadOnlyArray<StepStatusFilter>);
};

type AllFormattedChoicesReturn = {|
  +categories: $ReadOnlyArray<CategoryFilter>,
  +districts: $ReadOnlyArray<DistrictFilter>,
  +steps: $ReadOnlyArray<StepFilter>,
  +stepStatuses: $ReadOnlyArray<StepStatusFilter>,
|};

export const getAllFormattedChoicesForProject = (
  project: ProjectAdminProposals_project,
  stepId: ?Uuid
): AllFormattedChoicesReturn => ({
  categories: getFormattedCategoriesChoicesForProject(project),
  districts: getFormattedDistrictsChoicesForProject(project),
  steps: getFormattedStepsChoicesForProject(project),
  stepStatuses: getFormattedStatusesChoicesForProjectStep(project, stepId),
});
