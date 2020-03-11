// @flow

export type SortValues = 'oldest' | 'newest'

export type ParametersState = {
  sort: SortValues
};

export type Action =
  | { type: 'CHANGE_SORT', payload: SortValues }

export const createReducer = (state: ParametersState, action: Action) => {
  switch (action.type) {
    case 'CHANGE_SORT':
      return {
        ...state,
        sort: action.payload
      }
    default:
      throw new Error(`Unknown action : ${action.type}`);
  }
};
