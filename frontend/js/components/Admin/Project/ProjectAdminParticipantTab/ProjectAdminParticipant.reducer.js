// @flow
import type { Uuid } from '~/types';
import type { ProjectAdminParticipantStatus } from './ProjectAdminParticipant.context';

export type SortValues = 'oldest' | 'newest';

export type ParticipantsTypeValues = 'ALL' | string;

export type ParticipantsStepValues = 'ALL' | Uuid;

export type Filters = {|
  +type: ParticipantsTypeValues,
  +step: ParticipantsStepValues,
  +term: ?string,
|};

export type Filter = {|
  +id: Uuid,
  +type: 'step' | 'type',
|};

export type ProjectAdminParticipantState = {|
  +status: ProjectAdminParticipantStatus,
  +sort: SortValues,
  +filters: Filters,
  +filtersOrdered: Filter[],
|};

export type ProjectAdminParticipantParameters = {|
  +sort: $PropertyType<ProjectAdminParticipantState, 'sort'>,
  +filters: $PropertyType<ProjectAdminParticipantState, 'filters'>,
  +filtersOrdered: $PropertyType<ProjectAdminParticipantState, 'filtersOrdered'>,
|};

export type Action =
  | { type: 'START_LOADING' }
  | { type: 'STOP_LOADING' }
  | { type: 'CHANGE_SORT', payload: SortValues }
  | { type: 'CHANGE_STEP_FILTER', payload: ParticipantsStepValues }
  | { type: 'CLEAR_STEP_FILTER' }
  | { type: 'CHANGE_TYPE_FILTER', payload: ParticipantsTypeValues }
  | { type: 'CLEAR_TYPE_FILTER' }
  | { type: 'SEARCH_TERM', payload: ?string }
  | { type: 'CLEAR_TERM' };

export const createReducer = (state: ProjectAdminParticipantState, action: Action) => {
  switch (action.type) {
    case 'START_LOADING':
      return {
        ...state,
        status: 'loading',
      };
    case 'STOP_LOADING':
      return {
        ...state,
        status: 'ready',
      };
    case 'CHANGE_STEP_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          step: action.payload,
        },
        filtersOrdered: [
          {
            id: action.payload,
            type: 'step',
          },
          ...state.filtersOrdered.filter(filter => filter.type !== 'step'),
        ],
      };
    case 'CLEAR_STEP_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          step: 'ALL',
        },
        filtersOrdered: [...state.filtersOrdered.filter(filter => filter.type !== 'step')],
      };
    case 'CHANGE_TYPE_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          type: action.payload,
        },
        filtersOrdered: [
          {
            id: action.payload,
            type: 'type',
          },
          ...state.filtersOrdered.filter(filter => filter.type !== 'type'),
        ],
      };
    case 'CLEAR_TYPE_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          type: 'ALL',
        },
        filtersOrdered: [...state.filtersOrdered.filter(filter => filter.type !== 'type')],
      };
    case 'CHANGE_SORT':
      return {
        ...state,
        sort: action.payload,
      };
    case 'SEARCH_TERM':
      return {
        ...state,
        filters: {
          ...state.filters,
          term: action.payload,
        },
      };
    case 'CLEAR_TERM':
      return {
        ...state,
        filters: {
          ...state.filters,
          term: null,
        },
      };
    default:
      throw new Error(`Unknown action : ${action.type}`);
  }
};
