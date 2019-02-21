// @flow
import type { Exact, Action } from '../../types';

export type State = {
  +orderBy: ?string,
  +filters: {},
  +term: ?string,
  +theme: ?string,
  +project: ?string,
  +eventSelected: ?string,
  +isMobileListView: ?boolean,
};

const initialState: State = {
  orderBy: null,
  filters: {},
  term: null,
  theme: null,
  project: null,
  eventSelected: null,
  isMobileListView: true,
};
type ChangeOrderByAction = {
  type: 'event/CHANGE_ORDER_BY',
  orderBy: ?string,
};
type ChangeEventTermAction = { type: 'event/CHANGE_TERM', term: ?string };
type ChangeEventThemeAction = {
  type: 'event/CHANGE_THEME',
  theme: ?string,
};
type ChangeEventProjectAction = {
  type: 'event/CHANGE_PROJECT',
  project: ?string,
};
type ChangeEventSelectedAction = {
  type: 'event/CHANGE_EVENT_SELECTED',
  eventSelected: ?string,
};
type ChangeEventMobileListView = {
  type: 'event/CHANGE_EVENT_MOBILE_VIEW',
  isMobileListView: boolean,
};
export type EventAction =
  | ChangeOrderByAction
  | ChangeEventTermAction
  | ChangeEventThemeAction
  | ChangeEventProjectAction
  | ChangeEventSelectedAction
  | ChangeEventMobileListView
  | { type: 'event/CHANGE_FILTER', filter: string, value: string };

export const changeOrderBy = (orderBy: ?string): ChangeOrderByAction => ({
  type: 'event/CHANGE_ORDER_BY',
  orderBy,
});
export const changeTerm = (term: ?string): ChangeEventTermAction => ({
  type: 'event/CHANGE_TERM',
  term,
});
export const changeTheme = (theme: ?string): ChangeEventThemeAction => ({
  type: 'event/CHANGE_THEME',
  theme,
});
export const changeProject = (project: ?string): ChangeEventProjectAction => ({
  type: 'event/CHANGE_PROJECT',
  project,
});
export const changeEventSelected = (eventSelected: ?string): ChangeEventSelectedAction => ({
  type: 'event/CHANGE_EVENT_SELECTED',
  eventSelected,
});
export const changeEventMobileListView = (
  isMobileListView: boolean,
): ChangeEventMobileListView => ({
  type: 'event/CHANGE_EVENT_MOBILE_VIEW',
  isMobileListView,
});

export const reducer = (state: State = initialState, action: Action): Exact<State> => {
  switch (action.type) {
    case '@@INIT':
      return { ...initialState, ...state };
    case 'event/CHANGE_FILTER': {
      const filters = { ...state.filters, [action.filter]: action.value };
      return { ...state, filters };
    }
    case 'event/CHANGE_ORDER_BY':
      return { ...state, orderBy: action.orderBy };
    case 'event/CHANGE_TERM':
      return { ...state, term: action.term };
    case 'event/CHANGE_THEME':
      return { ...state, theme: action.theme };
    case 'event/CHANGE_PROJECT':
      return { ...state, project: action.project };
    case 'event/CHANGE_EVENT_SELECTED':
      return { ...state, eventSelected: action.eventSelected };
    case 'event/CHANGE_EVENT_MOBILE_VIEW':
      return { ...state, isMobileListView: action.isMobileListView };
    default:
      return state;
  }
};
