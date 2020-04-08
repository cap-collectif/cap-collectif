// @flow

import type { Uuid } from '~/types';
import type { ProjectAdminPageStatus } from '~/components/Admin/Project/ProjectAdminPage.context';

export type SortValues = 'oldest' | 'newest';

export type ProposalsStateValues = 'ALL' | 'PUBLISHED' | 'TRASHED' | 'DRAFT';

export type ProposalsCategoryValues = 'ALL' | Uuid;

export type ProposalsDistrictValues = 'ALL' | Uuid;

export type ProposalsStepValues = ?Uuid;

export type StepChanged = {
  id: Uuid,
  count: number,
};

export type StepsChangedProposal = {
  stepsAdded: StepChanged[],
  stepsRemoved: StepChanged[],
};

export type Filters = {|
  +state: ProposalsStateValues,
  +category: ProposalsCategoryValues,
  +district: ProposalsDistrictValues,
  +step: ProposalsStepValues,
  +status: ?string,
  +term: ?string,
|};

export type ProjectAdminPageState = {|
  +status: ProjectAdminPageStatus,
  +sort: SortValues,
  +stepsChangedProposal: StepsChangedProposal,
  +filters: Filters,
|};

export type ProjectAdminPageParameters = {|
  +sort: $PropertyType<ProjectAdminPageState, 'sort'>,
  +filters: $PropertyType<ProjectAdminPageState, 'filters'>,
  +stepsChangedProposal: $PropertyType<ProjectAdminPageState, 'stepsChangedProposal'>,
|};

export type Action =
  | { type: 'START_LOADING' }
  | { type: 'STOP_LOADING' }
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
  | {
      type: 'CHANGE_STEPS_ADDED_TO_PROPOSAL',
      payload: { stepId: Uuid, countSelectedProposal: number },
    }
  | {
      type: 'CHANGE_STEPS_REMOVED_FROM_PROPOSAL',
      payload: { stepId: Uuid, countSelectedProposal: number },
    }
  | { type: 'CLEAR_STEPS_CHANGED_PROPOSAL' }
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
    case 'CHANGE_STEPS_ADDED_TO_PROPOSAL':
      return {
        ...state,
        stepsChangedProposal: {
          stepsAdded: [
            ...state.stepsChangedProposal.stepsAdded,
            { id: action.payload.stepId, count: action.payload.countSelectedProposal },
          ],
          stepsRemoved: [
            ...state.stepsChangedProposal.stepsRemoved.filter(
              ({ id }) => id !== action.payload.stepId,
            ),
          ],
        },
      };
    case 'CHANGE_STEPS_REMOVED_FROM_PROPOSAL':
      return {
        ...state,
        stepsChangedProposal: {
          stepsRemoved: [
            ...state.stepsChangedProposal.stepsRemoved,
            { id: action.payload.stepId, count: action.payload.countSelectedProposal },
          ],
          stepsAdded: [
            ...state.stepsChangedProposal.stepsAdded.filter(
              ({ id }) => id !== action.payload.stepId,
            ),
          ],
        },
      };
    case 'CLEAR_STEPS_CHANGED_PROPOSAL':
      return {
        ...state,
        stepsChangedProposal: {
          stepsAdded: [],
          stepsRemoved: [],
        },
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
