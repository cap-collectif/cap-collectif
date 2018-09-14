// @flow
import type { Exact, Uuid, Action } from '../../types';

type ShowSourceCreateModalAction = {
  type: 'opinion/SHOW_SOURCE_CREATE_MODAL',
};


export type OpinionAction =
  | ShowSourceCreateModalAction;

export type State = {
  +showOpinionCreateModal: ?Uuid,
};

export const OPINION_VOTE_SUCCEEDED = 'opinion/OPINION_VOTE_SUCCEEDED';

const initialState: State = {
  showArgumentEditModal: null
};

export const openArgumentEditModal = (id: Uuid): ShowArgumentEditModalAction => ({
  type: 'opinion/SHOW_ARGUMENT_EDIT_MODAL',
  id,
});

export const reducer = (state: State = initialState, action: Action): Exact<State> => {
  switch (action.type) {
    case '@@INIT':
      return { ...initialState, ...state };
    default:
      return state;
  }
};
