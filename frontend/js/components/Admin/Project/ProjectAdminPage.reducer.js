// @flow

import type { Uuid } from '~/types';
import type { ProjectAdminPageStatus } from '~/components/Admin/Project/ProjectAdminPage.utils';
import {
  clearQueryUrl,
  getFieldsFromUrl,
  updateQueryUrl,
  URL_FILTER_WHITELIST,
} from '~/shared/utils/getFieldsFromUrl';

export const ORDER_BY: {
  OLDEST: 'oldest',
  NEWEST: 'newest',
  MOST_VOTES: 'most-votes',
  LEAST_VOTE: 'least-votes',
  MOST_POINTS: 'most-points',
  LEAST_POINT: 'least-points',
  MOST_RECENT_REVISIONS: 'most-recent-revisions',
  LEAST_RECENT_REVISIONS: 'least-recent-revisions',
} = {
  OLDEST: 'oldest',
  NEWEST: 'newest',
  MOST_VOTES: 'most-votes',
  LEAST_VOTE: 'least-votes',
  MOST_POINTS: 'most-points',
  LEAST_POINT: 'least-points',
  MOST_RECENT_REVISIONS: 'most-recent-revisions',
  LEAST_RECENT_REVISIONS: 'least-recent-revisions',
};

export type SortValues = $Values<typeof ORDER_BY>;

export type ProposalsStateValues = 'ALL' | 'PUBLISHED' | 'TRASHED' | 'DRAFT' | 'ARCHIVED';

export type ProposalsCategoryValues = 'ALL' | 'NONE' | Uuid;

export type ProposalsDistrictValues = 'ALL' | 'NONE' | Uuid;

export type ProposalsThemeValues = 'ALL' | 'NONE' | Uuid;

export type ProposalsStepValues = ?Uuid;

export type ProposalsStatusValues = 'ALL' | 'NONE' | string;

export const DEFAULT_STATUS: ProjectAdminPageStatus = 'ready';

export const DEFAULT_SORT: SortValues = 'newest';

export type ProposalsProgressStateValues =
  | 'ALL'
  | 'TODO'
  | 'IN_PROGRESS'
  | 'FAVOURABLE'
  | 'UNFAVOURABLE'
  | 'TOO_LATE';

export type Filters = {|
  +state: ProposalsStateValues,
  +progressState: ProposalsProgressStateValues,
  +category: ProposalsCategoryValues,
  +district: ProposalsDistrictValues,
  +theme: ProposalsThemeValues,
  +step: ProposalsStepValues,
  +status: ProposalsStatusValues,
  +term: ?string,
  +analysts: Uuid[],
  +supervisor: ?Uuid,
  +decisionMaker: ?Uuid,
|};

export const DEFAULT_FILTERS: Filters = {
  state: 'PUBLISHED',
  progressState: 'ALL',
  category: 'ALL',
  theme: 'ALL',
  district: 'ALL',
  step: null,
  status: 'ALL',
  term: null,
  analysts: [],
  supervisor: null,
  decisionMaker: null,
};

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

export type ProjectAdminPageState = {|
  +status: ProjectAdminPageStatus,
  +sort: SortValues,
  +filters: Filters,
  +filtersOrdered: Filter[],
  +initialSelectedStep: ?string,
|};

export type ProjectAdminPageParameters = {|
  +sort: $PropertyType<ProjectAdminPageState, 'sort'>,
  +filters: $PropertyType<ProjectAdminPageState, 'filters'>,
  +filtersOrdered: $PropertyType<ProjectAdminPageState, 'filtersOrdered'>,
|};

export type Action =
  | { type: 'START_LOADING' }
  | { type: 'STOP_LOADING' }
  | { type: 'CHANGE_SORT', payload: SortValues }
  | { type: 'CHANGE_STATUS_FILTER', payload: ProposalsStatusValues }
  | { type: 'CLEAR_STATUS_FILTER' }
  | { type: 'CHANGE_STEP_FILTER', payload: ProposalsStepValues }
  | { type: 'CLEAR_STEP_FILTER' }
  | { type: 'CHANGE_CATEGORY_FILTER', payload: ProposalsCategoryValues }
  | { type: 'CLEAR_CATEGORY_FILTER' }
  | { type: 'CHANGE_DISTRICT_FILTER', payload: ProposalsDistrictValues }
  | { type: 'CLEAR_DISTRICT_FILTER' }
  | { type: 'CHANGE_THEME_FILTER', payload: ProposalsThemeValues }
  | { type: 'CLEAR_THEME_FILTER' }
  | { type: 'CHANGE_PROGRESS_STATE_FILTER', payload: ProposalsProgressStateValues }
  | { type: 'CLEAR_PROGRESS_STATE_FILTER' }
  | { type: 'CHANGE_STATE_FILTER', payload: ProposalsStateValues }
  | { type: 'CHANGE_ANALYSTS_FILTER', payload: Uuid[] }
  | { type: 'CLEAR_ANALYSTS_FILTER' }
  | { type: 'CHANGE_SUPERVISOR_FILTER', payload: Uuid }
  | { type: 'CLEAR_SUPERVISOR_FILTER' }
  | { type: 'CHANGE_DECISION_MAKER_FILTER', payload: Uuid }
  | { type: 'CLEAR_DECISION_MAKER_FILTER' }
  | { type: 'SEARCH_TERM', payload: ?string }
  | { type: 'CLEAR_TERM' }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'INIT_FILTERS_FROM_URL' };

const url = new URL(window.location.href);

export const getInitialState = (initialSelectedStep: ?string): ProjectAdminPageState => ({
  status: DEFAULT_STATUS,
  sort: DEFAULT_SORT,
  filters: {
    ...DEFAULT_FILTERS,
    step: initialSelectedStep,
  },
  filtersOrdered: [...(initialSelectedStep ? [{ id: initialSelectedStep, type: 'step' }] : [])],
  initialSelectedStep,
});

export const createReducer = (state: ProjectAdminPageState, action: Action) => {
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
    case 'CHANGE_STATE_FILTER': {
      const initialState = getInitialState(state.initialSelectedStep);
      // We reset the url and keep only the state (ALL|PUBLISHED|DRAFT...) and the step
      // to reflect the change as we reset here to the initial state
      clearQueryUrl(url);
      updateQueryUrl(url, 'state', { value: action.payload });
      updateQueryUrl(url, 'step', { value: initialState.initialSelectedStep ?? '' });

      return {
        ...initialState,
        filters: {
          ...initialState.filters,
          state: action.payload,
        },
      };
    }
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
    case 'CHANGE_STEP_FILTER':
      updateQueryUrl(url, 'step', { value: action.payload ?? '' });

      return {
        ...state,
        filters: {
          ...state.filters,
          status: 'ALL',
          step: action.payload,
        },
        filtersOrdered: [
          ...(action.payload
            ? [
                {
                  id: action.payload,
                  type: 'step',
                },
              ]
            : []),
          ...state.filtersOrdered.filter(
            filter => filter.type !== 'step' && filter.type !== 'status',
          ),
        ],
      };
    case 'CLEAR_STEP_FILTER':
      updateQueryUrl(url, 'step', { delete: true });

      return {
        ...state,
        filters: {
          ...state.filters,
          status: 'ALL',
          step: null,
        },
        filtersOrdered: [
          ...state.filtersOrdered.filter(
            filter => filter.type !== 'step' && filter.type !== 'status',
          ),
        ],
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
    case 'CHANGE_PROGRESS_STATE_FILTER':
      updateQueryUrl(url, 'progressState', { value: action.payload });

      return {
        ...state,
        filters: {
          ...state.filters,
          progressState: action.payload,
        },
        filtersOrdered: [
          {
            id: action.payload,
            type: 'progressState',
          },
          ...state.filtersOrdered.filter(filter => filter.type !== 'progressState'),
        ],
      };
    case 'CLEAR_PROGRESS_STATE_FILTER':
      updateQueryUrl(url, 'progressState', { delete: true });

      return {
        ...state,
        filters: {
          ...state.filters,
          progressState: 'ALL',
        },
        filtersOrdered: [...state.filtersOrdered.filter(filter => filter.type !== 'progressState')],
      };
    case 'CHANGE_STATUS_FILTER':
      updateQueryUrl(url, 'status', { value: action.payload });

      return {
        ...state,
        filters: {
          ...state.filters,
          status: action.payload,
        },
        filtersOrdered: [
          {
            id: action.payload,
            type: 'status',
          },
          ...state.filtersOrdered.filter(filter => filter.type !== 'status'),
        ],
      };
    case 'CLEAR_STATUS_FILTER':
      updateQueryUrl(url, 'status', { delete: true });

      return {
        ...state,
        filters: {
          ...state.filters,
          status: 'ALL',
        },
        filtersOrdered: [...state.filtersOrdered.filter(filter => filter.type !== 'status')],
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
    case 'CLEAR_FILTERS':
      for (const key of url.searchParams.keys()) {
        updateQueryUrl(url, key, { delete: true });
      }

      return getInitialState(state.initialSelectedStep);
    case 'INIT_FILTERS_FROM_URL': {
      const filters = getFieldsFromUrl<Filters>(url, {
        default: DEFAULT_FILTERS,
        whitelist: [...URL_FILTER_WHITELIST, 'progressState', 'step', 'status'],
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
