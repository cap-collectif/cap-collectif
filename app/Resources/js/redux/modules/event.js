// @flow
import type { Exact, Action } from '../../types';

export type State = {
  +eventSelected: ?string,
  +isMobileListView: boolean,
  +showEventCreateModal: boolean,
};

const initialState: State = {
  eventSelected: null,
  isMobileListView: true,
  showEventCreateModal: false,
};
type ChangeEventSelectedAction = {
  type: 'event/CHANGE_EVENT_SELECTED',
  eventSelected: ?string,
};
type ChangeEventMobileListView = {
  type: 'event/CHANGE_EVENT_MOBILE_VIEW',
  isMobileListView: boolean,
};
type ShowEventCreateModalAction = {
  type: 'event/SHOW_EVENT_CREATE_MODAL',
};
type CloseEventCreateModalAction = {
  type: 'event/CLOSE_EVENT_CREATE_MODAL',
};
export type EventAction =
  | ChangeEventSelectedAction
  | ChangeEventMobileListView
  | ShowEventCreateModalAction
  | CloseEventCreateModalAction
  | { type: 'event/CHANGE_FILTER', filter: string, value: string };

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
export const openEventCreateModal = (): ShowEventCreateModalAction => ({
  type: 'event/SHOW_EVENT_CREATE_MODAL',
});
export const closeEventCreateModal = (): CloseEventCreateModalAction => ({
  type: 'event/CLOSE_EVENT_CREATE_MODAL',
});

export const reducer = (state: State = initialState, action: Action): Exact<State> => {
  switch (action.type) {
    case '@@INIT':
      return { ...initialState, ...state };
    case 'event/CHANGE_EVENT_SELECTED':
      return { ...state, eventSelected: action.eventSelected };
    case 'event/CHANGE_EVENT_MOBILE_VIEW':
      return { ...state, isMobileListView: action.isMobileListView };
    case 'event/SHOW_EVENT_CREATE_MODAL':
      return { ...state, showEventCreateModal: true };
    case 'event/CLOSE_EVENT_CREATE_MODAL':
      return { ...state, showEventCreateModal: false };
    default:
      return state;
  }
};
