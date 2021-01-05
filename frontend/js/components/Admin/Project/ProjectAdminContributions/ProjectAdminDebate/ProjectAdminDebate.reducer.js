// @flow
import { type ForOrAgainstValue } from '~relay/DebateArgument_argument.graphql';

export type ArgumentState = 'PUBLISHED' | 'WAITING' | 'TRASHED';

type FilterArgument = {|
  type: ForOrAgainstValue[],
  state: ArgumentState,
|};

export type Filters = {|
  +argument: FilterArgument,
|};

export type ProjectAdminDebateState = {|
  +filters: Filters,
|};

export type ProjectAdminDebateParameters = {|
  +filters: $PropertyType<ProjectAdminDebateState, 'filters'>,
|};

export type Action =
  | { type: 'CHANGE_ARGUMENT_TYPE', payload: ForOrAgainstValue[] }
  | { type: 'CHANGE_ARGUMENT_STATE', payload: ArgumentState };

export const createReducer = (state: ProjectAdminDebateState, action: Action) => {
  switch (action.type) {
    case 'CHANGE_ARGUMENT_TYPE':
      return {
        ...state,
        filters: {
          ...state.filters,
          argument: {
            ...state.filters.argument,
            type: action.payload,
          },
        },
      };
    case 'CHANGE_ARGUMENT_STATE':
      return {
        ...state,
        filters: {
          ...state.filters,
          argument: {
            ...state.filters.argument,
            state: action.payload,
          },
        },
      };
    default:
      throw new Error(`Unknown action : ${action.type}`);
  }
};
