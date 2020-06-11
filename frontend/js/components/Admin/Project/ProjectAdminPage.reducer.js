// @flow

import type { Uuid } from '~/types';
import type { ProjectAdminPageStatus } from '~/components/Admin/Project/ProjectAdminPage.context';
import { getInitialState } from '~/components/Admin/Project/ProjectAdminPage.context';

export type SortValues = 'oldest' | 'newest';

export type ProposalsStateValues = 'ALL' | 'PUBLISHED' | 'TRASHED' | 'DRAFT';

export type ProposalsCategoryValues = 'ALL' | 'NONE' | Uuid;

export type ProposalsDistrictValues = 'ALL' | 'NONE' | Uuid;

export type ProposalsStepValues = ?Uuid;

export type ProposalsStatusValues = 'ALL' | 'NONE' | string;

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
  +step: ProposalsStepValues,
  +status: ProposalsStatusValues,
  +term: ?string,
  +analysts: Uuid[],
  +supervisor: ?Uuid,
  +decisionMaker: ?Uuid,
|};

export type Filter = {|
  +id: Uuid,
  +type:
    | 'district'
    | 'category'
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
  | { type: 'CLEAR_TERM' };

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

      return {
        ...initialState,
        filters: {
          ...initialState.filters,
          state: action.payload,
        },
      };
    }
    case 'CHANGE_CATEGORY_FILTER':
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
      return {
        ...state,
        filters: {
          ...state.filters,
          category: 'ALL',
        },
        filtersOrdered: [...state.filtersOrdered.filter(filter => filter.type !== 'category')],
      };
    case 'CHANGE_STEP_FILTER':
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
      return {
        ...state,
        filters: {
          ...state.filters,
          district: 'ALL',
        },
        filtersOrdered: [...state.filtersOrdered.filter(filter => filter.type !== 'district')],
      };
    case 'CHANGE_PROGRESS_STATE_FILTER':
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
      return {
        ...state,
        filters: {
          ...state.filters,
          progressState: 'ALL',
        },
        filtersOrdered: [...state.filtersOrdered.filter(filter => filter.type !== 'progressState')],
      };
    case 'CHANGE_STATUS_FILTER':
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
      return {
        ...state,
        filters: {
          ...state.filters,
          status: 'ALL',
        },
        filtersOrdered: [...state.filtersOrdered.filter(filter => filter.type !== 'status')],
      };
    case 'CHANGE_ANALYSTS_FILTER':
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
      return {
        ...state,
        filters: {
          ...state.filters,
          analysts: [],
        },
        filtersOrdered: [...state.filtersOrdered.filter(filter => filter.type !== 'analysts')],
      };
    case 'CHANGE_SUPERVISOR_FILTER':
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
      return {
        ...state,
        filters: {
          ...state.filters,
          supervisor: null,
        },
        filtersOrdered: [...state.filtersOrdered.filter(filter => filter.type !== 'supervisor')],
      };
    case 'CHANGE_DECISION_MAKER_FILTER':
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
      return {
        ...state,
        filters: {
          ...state.filters,
          decisionMaker: null,
        },
        filtersOrdered: [...state.filtersOrdered.filter(filter => filter.type !== 'decisionMaker')],
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
