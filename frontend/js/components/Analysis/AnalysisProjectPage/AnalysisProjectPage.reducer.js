// @flow
import type { Uuid } from '~/types';
import type { AnalysisProjectPageStatus } from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.context';

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
  +state: StateValues,
  +district: ProposalsDistrictValues,
  +category: ProposalsCategoryValues,
  +analysts: Uuid[],
  +supervisor: ?Uuid,
  +decisionMaker: ?Uuid,
|};

export type AnalysisProjectPageState = {|
  +status: AnalysisProjectPageStatus,
  +sort: SortValues,
  +filters: Filters,
|};

export type AnalysisProjectPageParameters = {|
  +sort: $PropertyType<AnalysisProjectPageState, 'sort'>,
  +filters: $PropertyType<AnalysisProjectPageState, 'filters'>,
|};

export type Action =
  | { type: 'START_LOADING' }
  | { type: 'STOP_LOADING' }
  | { type: 'CHANGE_SORT', payload: SortValues }
  | { type: 'CHANGE_CATEGORY_FILTER', payload: ProposalsCategoryValues }
  | { type: 'CLEAR_CATEGORY_FILTER' }
  | { type: 'CHANGE_DISTRICT_FILTER', payload: ProposalsDistrictValues }
  | { type: 'CLEAR_DISTRICT_FILTER' }
  | { type: 'CHANGE_STATE_FILTER', payload: StateValues }
  | { type: 'CHANGE_ANALYSTS_FILTER', payload: Uuid[] }
  | { type: 'CHANGE_SUPERVISOR_FILTER', payload: Uuid }
  | { type: 'CHANGE_DECISION_MAKER_FILTER', payload: Uuid };

export const createReducer = (state: AnalysisProjectPageState, action: Action) => {
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
    case 'CHANGE_ANALYSTS_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          analysts: action.payload,
        },
      };
    case 'CHANGE_SUPERVISOR_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          supervisor: action.payload,
        },
      };
    case 'CHANGE_DECISION_MAKER_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          decisionMaker: action.payload,
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
