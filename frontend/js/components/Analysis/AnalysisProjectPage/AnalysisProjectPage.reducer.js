// @flow
import type { Uuid } from '~/types';
import type { AnalysisProjectPageStatus } from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.context';
import { INITIAL_STATE, DEFAULT_FILTERS } from './AnalysisProjectPage.context';
import {
  getFieldsFromUrl,
  updateQueryUrl,
  URL_FILTER_WHITELIST,
} from '~/shared/utils/analysis-filters';

export type ProposalsDistrictValues = 'ALL' | 'NONE' | Uuid;

export type ProposalsCategoryValues = 'ALL' | 'NONE' | Uuid;

export type ProposalsThemeValues = 'ALL' | 'NONE' | Uuid;

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
  +theme: ProposalsThemeValues,
  +analysts: Uuid[],
  +supervisor: ?Uuid,
  +decisionMaker: ?Uuid,
|};

// Filter 'status', 'step' and 'progressState' are for ProjectAdminAnalysis
export type Filter = {|
  +id: Uuid,
  +type:
    | 'district'
    | 'category'
    | 'theme'
    | 'status'
    | 'step'
    | 'progressState'
    | 'analysts'
    | 'supervisor'
    | 'decisionMaker',
|};

export type AnalysisProjectPageState = {|
  +status: AnalysisProjectPageStatus,
  +sort: SortValues,
  +filters: Filters,
  +filtersOrdered: Filter[],
|};

export type AnalysisProjectPageParameters = {|
  +sort: $PropertyType<AnalysisProjectPageState, 'sort'>,
  +filters: $PropertyType<AnalysisProjectPageState, 'filters'>,
  +filtersOrdered: $PropertyType<AnalysisProjectPageState, 'filtersOrdered'>,
|};

export type Action =
  | { type: 'START_LOADING' }
  | { type: 'STOP_LOADING' }
  | { type: 'CHANGE_SORT', payload: SortValues }
  | { type: 'CHANGE_CATEGORY_FILTER', payload: ProposalsCategoryValues }
  | { type: 'CLEAR_CATEGORY_FILTER' }
  | { type: 'CHANGE_DISTRICT_FILTER', payload: ProposalsDistrictValues }
  | { type: 'CLEAR_DISTRICT_FILTER' }
  | { type: 'CHANGE_THEME_FILTER', payload: ProposalsThemeValues }
  | { type: 'CLEAR_THEME_FILTER' }
  | { type: 'CHANGE_STATE_FILTER', payload: StateValues }
  | { type: 'CHANGE_ANALYSTS_FILTER', payload: Uuid[] }
  | { type: 'CLEAR_ANALYSTS_FILTER' }
  | { type: 'CHANGE_SUPERVISOR_FILTER', payload: Uuid }
  | { type: 'CLEAR_SUPERVISOR_FILTER' }
  | { type: 'CHANGE_DECISION_MAKER_FILTER', payload: Uuid }
  | { type: 'CLEAR_DECISION_MAKER_FILTER' }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'INIT_FILTERS_FROM_URL' };

const url = new URL(window.location.href);

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
      updateQueryUrl(url, 'state', { value: action.payload });
      return {
        ...state,
        filters: {
          ...state.filters,
          state: action.payload,
        },
      };
    case 'CHANGE_CATEGORY_FILTER':
      updateQueryUrl(url, 'category', { value: action.payload });
      return {
        ...state,
        filters: {
          ...state.filters,
          category: action.payload,
        },
        filtersOrdered: [
          {
            id: action.payload,
            type: 'category',
          },
          ...state.filtersOrdered.filter(filter => filter.type !== 'category'),
        ],
      };
    case 'CLEAR_CATEGORY_FILTER':
      updateQueryUrl(url, 'category', { delete: true });
      return {
        ...state,
        filters: {
          ...state.filters,
          category: 'ALL',
        },
        filtersOrdered: [...state.filtersOrdered.filter(filter => filter.type !== 'category')],
      };
    case 'CHANGE_DISTRICT_FILTER':
      updateQueryUrl(url, 'district', { value: action.payload });
      return {
        ...state,
        filters: {
          ...state.filters,
          district: action.payload,
        },
        filtersOrdered: [
          {
            id: action.payload,
            type: 'district',
          },
          ...state.filtersOrdered.filter(filter => filter.type !== 'district'),
        ],
      };
    case 'CLEAR_DISTRICT_FILTER':
      updateQueryUrl(url, 'district', { delete: true });
      return {
        ...state,
        filters: {
          ...state.filters,
          district: 'ALL',
        },
        filtersOrdered: [...state.filtersOrdered.filter(filter => filter.type !== 'district')],
      };
    case 'CHANGE_THEME_FILTER':
      updateQueryUrl(url, 'theme', { value: action.payload });
      return {
        ...state,
        filters: {
          ...state.filters,
          theme: action.payload,
        },
        filtersOrdered: [
          {
            id: action.payload,
            type: 'theme',
          },
          ...state.filtersOrdered.filter(filter => filter.type !== 'theme'),
        ],
      };
    case 'CLEAR_THEME_FILTER':
      updateQueryUrl(url, 'theme', { delete: true });
      return {
        ...state,
        filters: {
          ...state.filters,
          theme: 'ALL',
        },
        filtersOrdered: [...state.filtersOrdered.filter(filter => filter.type !== 'theme')],
      };
    case 'CHANGE_ANALYSTS_FILTER':
      updateQueryUrl(url, 'analysts', { value: action.payload });

      return {
        ...state,
        filters: {
          ...state.filters,
          analysts: action.payload,
        },
        filtersOrdered: [
          {
            id: action.payload[0],
            type: 'analysts',
          },
          ...state.filtersOrdered.filter(filter => filter.type !== 'analysts'),
        ],
      };
    case 'CLEAR_ANALYSTS_FILTER':
      updateQueryUrl(url, 'analysts', { delete: true });
      return {
        ...state,
        filters: {
          ...state.filters,
          analysts: [],
        },
        filtersOrdered: [...state.filtersOrdered.filter(filter => filter.type !== 'analysts')],
      };
    case 'CHANGE_SUPERVISOR_FILTER':
      updateQueryUrl(url, 'supervisor', { value: action.payload });
      return {
        ...state,
        filters: {
          ...state.filters,
          supervisor: action.payload,
        },
        filtersOrdered: [
          {
            id: action.payload,
            type: 'supervisor',
          },
          ...state.filtersOrdered.filter(filter => filter.type !== 'supervisor'),
        ],
      };
    case 'CLEAR_SUPERVISOR_FILTER':
      updateQueryUrl(url, 'supervisor', { delete: true });
      return {
        ...state,
        filters: {
          ...state.filters,
          supervisor: null,
        },
        filtersOrdered: [...state.filtersOrdered.filter(filter => filter.type !== 'supervisor')],
      };
    case 'CHANGE_DECISION_MAKER_FILTER':
      updateQueryUrl(url, 'decisionMaker', { value: action.payload });

      return {
        ...state,
        filters: {
          ...state.filters,
          decisionMaker: action.payload,
        },
        filtersOrdered: [
          {
            id: action.payload,
            type: 'decisionMaker',
          },
          ...state.filtersOrdered.filter(filter => filter.type !== 'decisionMaker'),
        ],
      };
    case 'CLEAR_DECISION_MAKER_FILTER':
      updateQueryUrl(url, 'decisionMaker', { delete: true });

      return {
        ...state,
        filters: {
          ...state.filters,
          decisionMaker: null,
        },
        filtersOrdered: [...state.filtersOrdered.filter(filter => filter.type !== 'decisionMaker')],
      };
    case 'CHANGE_SORT':
      updateQueryUrl(url, 'sort', { value: action.payload });

      return {
        ...state,
        sort: action.payload,
      };
    case 'CLEAR_FILTERS':
      for (const key of url.searchParams.keys()) {
        updateQueryUrl(url, key, { delete: true });
      }
      return INITIAL_STATE;
    case 'INIT_FILTERS_FROM_URL': {
      const filters = getFieldsFromUrl<Filters>(url, {
        default: DEFAULT_FILTERS,
        whitelist: URL_FILTER_WHITELIST,
      });
      const { sort } = getFieldsFromUrl<{ sort: SortValues }>(url, {
        default: {
          sort: ORDER_BY.NEWEST,
        },
        whitelist: ['sort'],
      });

      return {
        ...state,
        sort,
        filters,
        filtersOrdered: (Object.entries({ ...state.filters, ...filters }): any)
          .filter(
            filter =>
              (Array.isArray(filter[1]) && filter[1]?.length > 0) ||
              (!Array.isArray(filter[1]) && filter[1]),
          )
          .map(([name, value]) => ({
            id: value,
            type: name,
          })),
      };
    }
    default:
      throw new Error(`Unknown action : ${action.type}`);
  }
};
