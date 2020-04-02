// @flow
import type { Uuid } from '~/types';

export type ProposalsDistrictValues = 'ALL' | Uuid;

export type ProposalsCategoryValues = 'ALL' | Uuid;

export const ORDER_BY: {
  OLDEST: 'oldest',
  NEWEST: 'newest',
} = {
  OLDEST: 'oldest',
  NEWEST: 'newest',
};

export type SortValues = $Values<typeof ORDER_BY>;

export const STATE: {
  ALL: 'ALL',
  TODO: 'TODO',
  DONE: 'DONE',
} = {
  ALL: 'ALL',
  TODO: 'TODO',
  DONE: 'DONE',
};

export type StateValues = $Values<typeof STATE>;

export type Filters = {|
  state: StateValues,
  +district: ProposalsDistrictValues,
  +category: ProposalsCategoryValues,
  +analysts: ?Array<Uuid>,
  +supervisor: ?Uuid,
  +decisionMaker: ?Uuid,
|};

export type ParametersState = {|
  +sort: SortValues,
  +filters: Filters,
|};

export type Action =
  | { type: 'CHANGE_SORT', payload: SortValues }
  | { type: 'CHANGE_CATEGORY_FILTER', payload: ProposalsCategoryValues }
  | { type: 'CLEAR_CATEGORY_FILTER' }
  | { type: 'CHANGE_DISTRICT_FILTER', payload: ProposalsDistrictValues }
  | { type: 'CLEAR_DISTRICT_FILTER' }
  | { type: 'CHANGE_STATE_FILTER', payload: StateValues };

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
    case 'CHANGE_SORT':
      return {
        ...state,
        sort: action.payload,
      };
    default:
      throw new Error(`Unknown action : ${action.type}`);
  }
};
