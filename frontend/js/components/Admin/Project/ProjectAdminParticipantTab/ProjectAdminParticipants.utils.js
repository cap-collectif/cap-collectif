// @flow
import isEqual from 'lodash/isEqual';
import uniqBy from 'lodash/uniqBy';
import type { ProjectAdminParticipants_project } from '~relay/ProjectAdminParticipants_project.graphql';
import type { Uuid } from '~/types';
import type { ProjectAdminParticipantState } from './ProjectAdminParticipant.reducer';
import { SHOWING_STEP_TYPENAME } from '~/constants/AnalyseConstants';
import { DEFAULT_FILTERS } from './ProjectAdminParticipant.context';

export type StepFilter = {|
  +id: Uuid,
  +title: string,
|};

export type UserTypeFilter = {|
  +id: Uuid,
  +name: string,
|};

type FilterOrderedFormatted = {|
  +id: Uuid,
  +name: string,
  +type: 'step' | 'status',
  +action?: string,
  +icon?: string,
  +color?: ?string,
  +isShow: boolean,
|};

export const getFormattedStepsChoicesForProject = (
  project: ProjectAdminParticipants_project,
): $ReadOnlyArray<StepFilter> => {
  return ((project.steps
    .filter(Boolean)
    .filter(step => SHOWING_STEP_TYPENAME.includes(step.__typename))
    .map(step => ({
      id: step.id,
      title: step.title,
    })): any): $ReadOnlyArray<StepFilter>);
};

export const getFormattedUserTypeChoicesForProject = (
  project: ProjectAdminParticipants_project,
): $ReadOnlyArray<UserTypeFilter> => {
  const usersTypes = ((project.participants?.edges
    ?.filter(Boolean)
    .map(edge => edge.node)
    .filter(Boolean)
    .filter(participant => participant.userType)
    .map(participant => ({
      id: participant.userType?.id,
      name: participant.userType?.name,
    })): any): $ReadOnlyArray<UserTypeFilter>);

  return uniqBy(usersTypes, 'id');
};

type AllFormattedChoicesReturn = {|
  +steps: $ReadOnlyArray<StepFilter>,
  +userTypes: $ReadOnlyArray<UserTypeFilter>,
  +filtersOrdered: $ReadOnlyArray<FilterOrderedFormatted>,
|};

const getFormattedFiltersOrdered = (
  filtersOrdered: $PropertyType<ProjectAdminParticipantState, 'filtersOrdered'>,
  steps: $ReadOnlyArray<StepFilter>,
  userTypes: $ReadOnlyArray<UserTypeFilter>,
): $ReadOnlyArray<FilterOrderedFormatted> => {
  return ((filtersOrdered
    .map(filter => {
      if (filter.id === 'ALL' || filter.id === 'NONE') {
        return false;
      }

      if (filter.type === 'step') {
        const step = ((steps.find(({ id }) => id === filter.id): any): StepFilter);
        if (!step) return null;

        return {
          id: step.id,
          name: step.title,
          type: 'step',
          icon: 'stack',
          action: 'CLEAR_STEP_FILTER',
        };
      }

      if (filter.type === 'type') {
        const userType = ((userTypes.find(({ id }) => id === filter.id): any): UserTypeFilter);

        return {
          id: userType.id,
          name: userType.name,
          type: 'type',
          icon: 'singleManFilled',
          action: 'CLEAR_TYPE_FILTER',
        };
      }
    })
    .filter(Boolean): any): $ReadOnlyArray<FilterOrderedFormatted>);
};

export const getAllFormattedChoicesForProject = (
  project: ProjectAdminParticipants_project,
  filtersOrdered: $PropertyType<ProjectAdminParticipantState, 'filtersOrdered'>,
): AllFormattedChoicesReturn => {
  const steps = getFormattedStepsChoicesForProject(project);
  const userTypes = getFormattedUserTypeChoicesForProject(project);

  return {
    steps,
    userTypes,
    filtersOrdered: getFormattedFiltersOrdered(filtersOrdered, steps, userTypes),
  };
};

export const getWordingEmpty = (hasSelectedFilters: boolean): { title: string, text: string } => {
  if (hasSelectedFilters) {
    return {
      title: 'participant.list.help.title.no.search.result',
      text: 'participant.list.help.text.no.search.result',
    };
  }

  return {
    title: 'empty.section.no.participant',
    text: 'help.text.participant.type.shown',
  };
};

export const getDifferenceFilters = (
  filters: $PropertyType<ProjectAdminParticipantState, 'filters'>,
): boolean => {
  const filtersFormatted = {
    type: filters.type,
    step: filters.step,
  };

  const defaultFilters = {
    type: DEFAULT_FILTERS.type,
    step: DEFAULT_FILTERS.step,
  };

  return !isEqual(defaultFilters, filtersFormatted);
};
