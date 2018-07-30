// @flow
import type { Exact, Uuid, Action } from '../../types';

type ShowSourceCreateModalAction = {
  type: 'opinion/SHOW_SOURCE_CREATE_MODAL',
};
type HideSourceCreateModalAction = {
  type: 'opinion/HIDE_SOURCE_CREATE_MODAL',
};
type HideArgumentEditModalAction = {
  type: 'opinion/HIDE_ARGUMENT_EDIT_MODAL',
};
type ShowArgumentEditModalAction = {
  type: 'opinion/SHOW_ARGUMENT_EDIT_MODAL',
  id: Uuid,
};
type ShowSourceEditModalAction = {
  type: 'opinion/SHOW_SOURCE_EDIT_MODAL',
  id: Uuid,
};
type HideSourceEditModalAction = {
  type: 'opinion/HIDE_SOURCE_EDIT_MODAL',
};
type StartEditOpinionVersionAction = {
  type: 'opinion/START_EDIT_OPINION_VERSION',
};
type CancelEditOpinionVersionAction = {
  type: 'opinion/CANCEL_EDIT_OPINION_VERSION',
};
type StartCreateOpinionVersionAction = {
  type: 'opinion/START_CREATE_OPINION_VERSION',
};
type CancelCreateOpinionVersionAction = {
  type: 'opinion/CANCEL_CREATE_OPINION_VERSION',
};
type ShowOpinionVersionEditModalAction = {
  type: 'opinion/SHOW_OPINION_VERSION_EDIT_MODAL',
};
type CloseOpinionVersionEditModalAction = {
  type: 'opinion/CLOSE_OPINION_VERSION_EDIT_MODAL',
};
type ShowOpinionVersionCreateModalAction = {
  type: 'opinion/SHOW_OPINION_VERSION_CREATE_MODAL',
};
type CloseOpinionVersionCreateModalAction = {
  type: 'opinion/CLOSE_OPINION_VERSION_CREATE_MODAL',
};
type ShowOpinionCreateModalAction = {
  type: 'opinion/SHOW_OPINION_CREATE_MODAL',
  opinionTypeId: Uuid,
};
type CloseOpinionCreateModalAction = {
  type: 'opinion/CLOSE_OPINION_CREATE_MODAL',
};
type ShowOpinionEditModalAction = {
  type: 'opinion/SHOW_OPINION_EDIT_MODAL',
  opinionId: Uuid,
};
type CloseOpinionEditModalAction = { type: 'opinion/CLOSE_OPINION_EDIT_MODAL' };

export type OpinionAction =
  | ShowSourceCreateModalAction
  | HideSourceCreateModalAction
  | HideSourceEditModalAction
  | HideArgumentEditModalAction
  | ShowArgumentEditModalAction
  | StartEditOpinionVersionAction
  | CancelEditOpinionVersionAction
  | ShowOpinionVersionEditModalAction
  | CloseOpinionVersionEditModalAction
  | ShowOpinionVersionCreateModalAction
  | CloseOpinionVersionCreateModalAction
  | StartCreateOpinionVersionAction
  | CancelCreateOpinionVersionAction
  | ShowOpinionCreateModalAction
  | CloseOpinionCreateModalAction
  | ShowOpinionEditModalAction
  | ShowSourceEditModalAction
  | CloseOpinionEditModalAction;

export type State = {
  +showOpinionCreateModal: ?Uuid,
  +showOpinionEditModal: ?Uuid,
  +showArgumentEditModal: ?Uuid,
  +showOpinionVersionEditModal: boolean,
  +isCreatingOpinionVersion: boolean,
  +showOpinionVersionCreateModal: boolean,
  +showSourceCreateModal: boolean,
  +showSourceEditModal: ?Uuid,
};

export const OPINION_VOTE_SUCCEEDED = 'opinion/OPINION_VOTE_SUCCEEDED';
export const VERSION_VOTE_SUCCEEDED = 'opinion/VERSION_VOTE_SUCCEEDED';
export const DELETE_OPINION_VOTE_SUCCEEDED = 'opinion/DELETE_OPINION_VOTE_SUCCEEDED';
export const DELETE_VERSION_VOTE_SUCCEEDED = 'opinion/DELETE_VERSION_VOTE_SUCCEEDED';

const initialState: State = {
  showArgumentEditModal: null,
  showOpinionCreateModal: null,
  showOpinionEditModal: null,
  showOpinionVersionEditModal: false,
  isCreatingOpinionVersion: false,
  showOpinionVersionCreateModal: false,
  showSourceCreateModal: false,
  showSourceEditModal: null,
};

export const openArgumentEditModal = (id: Uuid): ShowArgumentEditModalAction => ({
  type: 'opinion/SHOW_ARGUMENT_EDIT_MODAL',
  id,
});

export const showSourceEditModal = (id: Uuid): ShowSourceEditModalAction => ({
  type: 'opinion/SHOW_SOURCE_EDIT_MODAL',
  id,
});
export const hideSourceEditModal = (): HideSourceEditModalAction => ({
  type: 'opinion/HIDE_SOURCE_EDIT_MODAL',
});

export const showSourceCreateModal = (): ShowSourceCreateModalAction => ({
  type: 'opinion/SHOW_SOURCE_CREATE_MODAL',
});
export const hideSourceCreateModal = (): HideSourceCreateModalAction => ({
  type: 'opinion/HIDE_SOURCE_CREATE_MODAL',
});

export const closeArgumentEditModal = (): HideArgumentEditModalAction => ({
  type: 'opinion/HIDE_ARGUMENT_EDIT_MODAL',
});

export const startCreatingOpinionVersion = (): StartCreateOpinionVersionAction => ({
  type: 'opinion/START_CREATE_OPINION_VERSION',
});
export const cancelCreatingOpinionVersion = (): CancelCreateOpinionVersionAction => ({
  type: 'opinion/CANCEL_CREATE_OPINION_VERSION',
});
export const showOpinionVersionEditModal = (): ShowOpinionVersionEditModalAction => ({
  type: 'opinion/SHOW_OPINION_VERSION_EDIT_MODAL',
});
export const closeOpinionVersionEditModal = (): CloseOpinionVersionEditModalAction => ({
  type: 'opinion/CLOSE_OPINION_VERSION_EDIT_MODAL',
});
export const closeOpinionVersionCreateModal = (): CloseOpinionVersionCreateModalAction => ({
  type: 'opinion/CLOSE_OPINION_VERSION_CREATE_MODAL',
});
export const showOpinionVersionCreateModal = (): ShowOpinionVersionCreateModalAction => ({
  type: 'opinion/SHOW_OPINION_VERSION_CREATE_MODAL',
});

export const openOpinionCreateModal = (opinionTypeId: Uuid): ShowOpinionCreateModalAction => ({
  type: 'opinion/SHOW_OPINION_CREATE_MODAL',
  opinionTypeId,
});
export const closeOpinionCreateModal = (): CloseOpinionCreateModalAction => ({
  type: 'opinion/CLOSE_OPINION_CREATE_MODAL',
});
export const openOpinionEditModal = (opinionId: Uuid): ShowOpinionEditModalAction => ({
  type: 'opinion/SHOW_OPINION_EDIT_MODAL',
  opinionId,
});
export const closeOpinionEditModal = (): CloseOpinionEditModalAction => ({
  type: 'opinion/CLOSE_OPINION_EDIT_MODAL',
});

export const reducer = (state: State = initialState, action: Action): Exact<State> => {
  switch (action.type) {
    case '@@INIT':
      return { ...initialState, ...state };
    case 'opinion/SHOW_SOURCE_EDIT_MODAL': {
      return { ...state, showSourceEditModal: action.id };
    }
    case 'opinion/HIDE_SOURCE_EDIT_MODAL': {
      return { ...state, showSourceEditModal: null };
    }
    case 'opinion/SHOW_SOURCE_CREATE_MODAL': {
      return { ...state, showSourceCreateModal: true };
    }
    case 'opinion/HIDE_SOURCE_CREATE_MODAL': {
      return { ...state, showSourceCreateModal: false };
    }
    case 'opinion/SHOW_ARGUMENT_EDIT_MODAL': {
      return { ...state, showArgumentEditModal: action.id };
    }
    case 'opinion/HIDE_ARGUMENT_EDIT_MODAL': {
      return { ...state, showArgumentEditModal: null };
    }
    case 'opinion/START_CREATE_OPINION_VERSION': {
      return { ...state, isCreatingOpinionVersion: true };
    }
    case 'opinion/CANCEL_CREATE_OPINION_VERSION': {
      return { ...state, isCreatingOpinionVersion: false };
    }
    case 'opinion/SHOW_OPINION_VERSION_EDIT_MODAL': {
      return { ...state, showOpinionVersionEditModal: true };
    }
    case 'opinion/CLOSE_OPINION_VERSION_EDIT_MODAL': {
      return { ...state, showOpinionVersionEditModal: false };
    }
    case 'opinion/SHOW_OPINION_VERSION_CREATE_MODAL': {
      return { ...state, showOpinionVersionCreateModal: true };
    }
    case 'opinion/CLOSE_OPINION_EDIT_MODAL':
      return { ...state, showOpinionEditModal: null };
    case 'opinion/SHOW_OPINION_EDIT_MODAL':
      return { ...state, showOpinionEditModal: action.opinionId };
    case 'opinion/CLOSE_OPINION_CREATE_MODAL':
      return { ...state, showOpinionCreateModal: null };
    case 'opinion/SHOW_OPINION_CREATE_MODAL':
      return { ...state, showOpinionCreateModal: action.opinionTypeId };
    case 'opinion/CLOSE_OPINION_VERSION_CREATE_MODAL': {
      return { ...state, showOpinionVersionCreateModal: false };
    }
    default:
      return state;
  }
};
