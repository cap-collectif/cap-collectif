// @flow
import { clearQueryUrl, getFieldsFromUrl, updateQueryUrl } from '~/shared/utils/getFieldsFromUrl';

export const ORDER_BY: {
  OLDEST: 'oldest',
  NEWEST: 'newest',
} = {
  OLDEST: 'oldest',
  NEWEST: 'newest',
};

export type DashboardStatus = 'ready' | 'loading';

export type SortValues = $Values<typeof ORDER_BY>;

export type CampaignsStateValues = 'ALL' | 'SENT' | 'PLANNED' | 'DRAFT';

export type Filters = {|
  +state: CampaignsStateValues,
  +term: ?string,
|};

export const DEFAULT_FILTERS: Filters = {
  state: 'ALL',
  term: null,
};

export type DashboardState = {|
  +status: DashboardStatus,
  +sort: SortValues,
  +filters: Filters,
|};

export type DashboardParameters = {|
  +sort: $PropertyType<DashboardState, 'sort'>,
  +filters: $PropertyType<DashboardState, 'filters'>,
|};

export const DEFAULT_STATUS: DashboardStatus = 'ready';

export const DEFAULT_SORT: SortValues = ORDER_BY.NEWEST;

export const getInitialState = (): DashboardState => ({
  status: DEFAULT_STATUS,
  sort: DEFAULT_SORT,
  filters: DEFAULT_FILTERS,
});

export type Action =
  | { type: 'START_LOADING' }
  | { type: 'STOP_LOADING' }
  | { type: 'CHANGE_SORT', payload: SortValues }
  | { type: 'CHANGE_STATE_FILTER', payload: CampaignsStateValues }
  | { type: 'SEARCH_TERM', payload: ?string }
  | { type: 'CLEAR_TERM' }
  | { type: 'INIT_FILTERS_FROM_URL' };

const url = new URL(window.location.href);

export const createReducer = (state: DashboardState, action: Action) => {
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
      const initialState = getInitialState();
      // We reset the url and keep only the state (ALL|PUBLISHED|DRAFT...) and the step
      // to reflect the change as we reset here to the initial state
      clearQueryUrl(url);
      updateQueryUrl(url, 'state', { value: action.payload });

      return {
        ...initialState,
        filters: {
          ...initialState.filters,
          state: action.payload,
        },
      };
    }
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
    case 'INIT_FILTERS_FROM_URL': {
      const filters = getFieldsFromUrl<Filters>(url, {
        default: DEFAULT_FILTERS,
        whitelist: ['term', 'state'],
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
      };
    }
    default:
      throw new Error(`Unknown action : ${action.type}`);
  }
};
