// @flow
import uniqBy from 'lodash/uniqBy';
import type { Uuid } from '~/types';

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
}

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

const SHOWING_STEP_TYPENAME = ['CollectStep', 'SelectionStep'];

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
