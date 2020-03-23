// @flow

import type { Uuid } from '~/types';

export type SortValues = 'oldest' | 'newest';

export type ProposalsStateValues = 'ALL' | 'PUBLISHED' | 'TRASHED' | 'DRAFT';

export type ProposalsCategoryValues = 'ALL' | Uuid;

export type ProposalsDistrictValues = 'ALL' | Uuid;

export type ProposalsStepValues = ?Uuid;

export type Filters = {|
  +state: ProposalsStateValues,
  +category: ProposalsCategoryValues,
  +district: ProposalsDistrictValues,
  +step: ProposalsStepValues,
  +status: ?string,
  +term: ?string,
|};

export type ParametersState = {|
  +sort: SortValues,
  +filters: Filters,
|};

export type Action =
  | { type: 'CHANGE_SORT', payload: SortValues }
  | { type: 'CHANGE_STATUS_FILTER', payload: ?string }
  | { type: 'CLEAR_STATUS_FILTER' }
  | { type: 'CHANGE_STEP_FILTER', payload: ProposalsStepValues }
  | { type: 'CLEAR_STEP_FILTER' }
  | { type: 'CHANGE_CATEGORY_FILTER', payload: ProposalsCategoryValues }
  | { type: 'CLEAR_CATEGORY_FILTER' }
  | { type: 'CHANGE_DISTRICT_FILTER', payload: ProposalsDistrictValues }
  | { type: 'CLEAR_DISTRICT_FILTER' }
  | { type: 'CHANGE_STATE_FILTER', payload: ProposalsStateValues }
  | { type: 'SEARCH_TERM', payload: ?string }
  | { type: 'CLEAR_TERM' };

export const createReducer = (state: ParametersState, action: Action) => {
  switch (action.type) {
    case 'CHANGE_STATE_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          state: action.payload,
        },
      };
    case 'CHANGE_CATEGORY_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          category: action.payload,
        },
      };
    case 'CLEAR_CATEGORY_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          category: 'ALL',
        },
      };
    case 'CHANGE_STEP_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          status: null,
          step: action.payload,
        },
      };
    case 'CLEAR_STEP_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          status: null,
          step: null,
        },
      };
    case 'CHANGE_DISTRICT_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          district: action.payload,
        },
      };
    case 'CLEAR_DISTRICT_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          district: 'ALL',
        },
      };
    case 'CHANGE_STATUS_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          status: action.payload,
        },
      };
    case 'CLEAR_STATUS_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          status: null,
        },
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
