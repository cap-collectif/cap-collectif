// @flow
import { takeEvery, select } from 'redux-saga/effects';
import LocalStorageService from '../../services/LocalStorageService';
import FluxDispatcher from '../../dispatchers/AppDispatcher';
import { UPDATE_ALERT } from '../../constants/AlertConstants';
import addVote from '../../mutations/AddProposalVoteMutation';
import removeVote from '../../mutations/RemoveProposalVoteMutation';
import DeleteProposalMutation from '../../mutations/DeleteProposalMutation';
import type { Exact, State as GlobalState, Dispatch, Uuid, Action } from '../../types';

export type ProposalViewMode = 'mosaic' | 'table' | 'map';

type Status = { name: string, id: number, color: string };
type ChangeFilterAction = {
  type: 'proposal/CHANGE_FILTER',
  filter: string,
  value: string,
};
type ChangeOrderAction = { type: 'proposal/CHANGE_ORDER', order: string };

type LoadSelectionsAction = {
  type: 'proposal/LOAD_SELECTIONS_REQUEST',
  proposalId: Uuid,
};
type CloseCreateFusionModalAction = {
  type: 'proposal/CLOSE_CREATE_FUSION_MODAL',
};
type OpenCreateFusionModalAction = {
  type: 'proposal/OPEN_CREATE_FUSION_MODAL',
};
type CloseEditProposalModalAction = { type: 'proposal/CLOSE_EDIT_MODAL' };
type OpenEditProposalModalAction = { type: 'proposal/OPEN_EDIT_MODAL' };
type CloseDeleteProposalModalAction = { type: 'proposal/CLOSE_DELETE_MODAL' };
type OpenDeleteProposalModalAction = { type: 'proposal/OPEN_DELETE_MODAL' };
type OpenCreateModalAction = { type: 'proposal/OPEN_CREATE_MODAL' };
type CloseCreateModalAction = { type: 'proposal/CLOSE_CREATE_MODAL' };
type ChangePageAction = { type: 'proposal/CHANGE_PAGE', page: number };
type ChangeTermAction = { type: 'proposal/CHANGE_TERMS', terms: string };
type OpenVoteModalAction = { type: 'proposal/OPEN_VOTE_MODAL', id: Uuid };
type CloseVoteModalAction = { type: 'proposal/CLOSE_VOTE_MODAL' };
type RequestVotingAction = { type: 'proposal/VOTE_REQUESTED' };
type VoteFailedAction = { type: 'proposal/VOTE_FAILED' };
type OpenDetailLikersModalAction = { type: 'proposal/OPEN_DETAIL_LIKERS_MODAL', id: string };
type CloseDetailLikersModalAction = { type: 'proposal/CLOSE_DETAIL_LIKERS_MODAL' };
type ChangeProposalListViewAction = {
  type: 'proposal/CHANGE_PROPOSAL_LIST_VIEW',
  mode: ProposalViewMode,
};
type Step = {
  type?: string,
  statuses?: Array<Status>,
  id: Uuid,
};
type Selection = { step: Step, status: ?Status };
export type Proposal = {
  selections: Array<Selection>,
  viewerCanSeeEvaluation: boolean,
} & Object;
export type State = {
  +currentVoteModal: ?Uuid,
  +currentDeletingVote: ?Uuid,
  +showCreateModal: boolean,
  +isCreatingFusion: boolean,
  +showDeleteModal: boolean,
  +isDeleting: boolean,
  +isVoting: boolean,
  +isLoading: boolean,
  +isEditing: boolean,
  +showEditModal: boolean,
  +order: string,
  +filters: Object,
  +terms: ?string,
  +lastEditedStepId: ?Uuid,
  +lastEditedProposalId: ?Uuid,
  +lastNotifiedStepId: ?Uuid,
  +selectedViewByStep: ProposalViewMode,
  +referer: ?string,
  +showDetailLikersModal: ?string,
};

export const initialState: State = {
  lastEditedStepId: null,
  currentVoteModal: null,
  currentDeletingVote: null,
  showCreateModal: false,
  isCreatingFusion: false,
  showDeleteModal: false,
  isDeleting: false,
  isVoting: false,
  isLoading: true,
  isEditing: false,
  showEditModal: false,
  order: 'random',
  filters: {},
  terms: null,
  lastEditedProposalId: null,
  lastNotifiedStepId: null,
  selectedViewByStep: 'mosaic',
  referer: null,
  showDetailLikersModal: null,
};

export const closeCreateFusionModal = (): CloseCreateFusionModalAction => ({
  type: 'proposal/CLOSE_CREATE_FUSION_MODAL',
});
export const openCreateFusionModal = (): OpenCreateFusionModalAction => ({
  type: 'proposal/OPEN_CREATE_FUSION_MODAL',
});
export const closeEditProposalModal = (): CloseEditProposalModalAction => ({
  type: 'proposal/CLOSE_EDIT_MODAL',
});
export const openEditProposalModal = (): OpenEditProposalModalAction => ({
  type: 'proposal/OPEN_EDIT_MODAL',
});
export const closeDeleteProposalModal = (): CloseDeleteProposalModalAction => ({
  type: 'proposal/CLOSE_DELETE_MODAL',
});
export const openDeleteProposalModal = (): OpenDeleteProposalModalAction => ({
  type: 'proposal/OPEN_DELETE_MODAL',
});

export const openCreateModal = (): OpenCreateModalAction => ({
  type: 'proposal/OPEN_CREATE_MODAL',
});
export const closeCreateModal = (): CloseCreateModalAction => ({
  type: 'proposal/CLOSE_CREATE_MODAL',
});
export const openVoteModal = (id: Uuid): OpenVoteModalAction => ({
  type: 'proposal/OPEN_VOTE_MODAL',
  id,
});
export const closeVoteModal = (): CloseVoteModalAction => ({
  type: 'proposal/CLOSE_VOTE_MODAL',
});
export const changePage = (page: number): ChangePageAction => ({
  type: 'proposal/CHANGE_PAGE',
  page,
});
export const changeOrder = (order: string): ChangeOrderAction => ({
  type: 'proposal/CHANGE_ORDER',
  order,
});
export const changeTerm = (terms: string): ChangeTermAction => ({
  type: 'proposal/CHANGE_TERMS',
  terms,
});
export const changeFilter = (filter: string, value: string): ChangeFilterAction => ({
  type: 'proposal/CHANGE_FILTER',
  filter,
  value,
});
export const changeProposalListView = (mode: ProposalViewMode): ChangeProposalListViewAction => ({
  type: 'proposal/CHANGE_PROPOSAL_LIST_VIEW',
  mode,
});
export const openDetailLikersModal = (id: string): OpenDetailLikersModalAction => ({
  type: 'proposal/OPEN_DETAIL_LIKERS_MODAL',
  id,
});
export const closeDetailLikersModal = (): CloseDetailLikersModalAction => ({
  type: 'proposal/CLOSE_DETAIL_LIKERS_MODAL',
});

type RequestDeleteAction = { type: 'proposal/DELETE_REQUEST' };
const deleteRequest = (): RequestDeleteAction => ({
  type: 'proposal/DELETE_REQUEST',
});

export const deleteProposal = (proposalId: string, dispatch: Dispatch): void => {
  dispatch(deleteRequest());
  DeleteProposalMutation.commit({ input: { proposalId } })
    .then(response => {
      dispatch(closeDeleteProposalModal());
      if (response.deleteProposal) {
        window.location.href = response.deleteProposal.step.url;
      }
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          bsStyle: 'success',
          content: 'proposal.request.delete.success',
        },
      });
    })
    .catch(() => {
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          bsStyle: 'warning',
          content: 'global.failure',
        },
      });
    });
};
export const startVoting = (): RequestVotingAction => ({
  type: 'proposal/VOTE_REQUESTED',
});
export const stopVoting = (): VoteFailedAction => ({
  type: 'proposal/VOTE_FAILED',
});

export const vote = (dispatch: Dispatch, stepId: Uuid, proposalId: Uuid, anonymously: boolean) => {
  dispatch(startVoting());
  return addVote
    .commit({
      stepId,
      input: { proposalId, stepId, anonymously },
    })
    .then(response => {
      dispatch(closeVoteModal());
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: { bsStyle: 'success', content: 'vote.add_success' },
      });
      return response;
    })
    .catch(e => {
      console.log(e); // eslint-disable-line no-console
      dispatch(closeVoteModal());
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: { bsStyle: 'danger', content: 'global.failure' },
      });
    });
};

export const deleteVote = (step: Object, proposal: Object, isAuthenticated: boolean) =>
  removeVote
    .commit({
      stepId: step.id,
      input: { proposalId: proposal.id, stepId: step.id },
      isAuthenticated,
    })
    .then(() => {
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          bsStyle: 'success',
          content: 'vote.delete_success',
        },
      });
    })
    .catch(e => {
      console.log(e); // eslint-disable-line no-console
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          bsStyle: 'warning',
          content: 'global.failure',
        },
      });
    });

export function* storeFiltersInLocalStorage(action: ChangeFilterAction): Generator<*, *, *> {
  const { filter, value } = action;
  const state: GlobalState = yield select();
  const filters = { ...state.proposal.filters, [filter]: value };
  const filtersByStep: { [id: Uuid]: Object } =
    LocalStorageService.get('proposal.filtersByStep') || {};
  if (state.project.currentProjectStepById) {
    filtersByStep[state.project.currentProjectStepById] = filters;
  }
  LocalStorageService.set('proposal.filtersByStep', filtersByStep);
}

export function* storeTermsInLocalStorage(action: ChangeTermAction): Generator<*, *, *> {
  const { terms } = action;
  const state: GlobalState = yield select();
  const termsByStep: { [id: Uuid]: string } = LocalStorageService.get('proposal.termsByStep') || {};
  if (state.project.currentProjectStepById) {
    termsByStep[state.project.currentProjectStepById] = terms;
  }
  LocalStorageService.set('proposal.termsByStep', termsByStep);
}

export function* storeOrderInLocalStorage(action: ChangeOrderAction): Generator<*, *, *> {
  const { order } = action;
  const state: GlobalState = yield select();
  const orderByStep: { [id: Uuid]: string } = LocalStorageService.get('proposal.orderByStep') || {};
  if (state.project.currentProjectStepById) {
    orderByStep[state.project.currentProjectStepById] = order;
  }
  LocalStorageService.set('proposal.orderByStep', orderByStep);
}

export type ProposalAction =
  | OpenCreateModalAction
  | ChangeFilterAction
  | VoteFailedAction
  | RequestVotingAction
  | ChangeTermAction
  | ChangeOrderAction
  | OpenDeleteProposalModalAction
  | ChangePageAction
  | CloseCreateModalAction
  | OpenVoteModalAction
  | OpenDeleteProposalModalAction
  | LoadSelectionsAction
  | CloseEditProposalModalAction
  | CloseVoteModalAction
  | CloseDeleteProposalModalAction
  | RequestDeleteAction
  | ChangeProposalListViewAction
  | OpenCreateFusionModalAction
  | CloseCreateFusionModalAction
  | OpenEditProposalModalAction
  | OpenDetailLikersModalAction
  | CloseDetailLikersModalAction
  | { type: 'proposal/POSTS_FETCH_FAILED', error: Error }
  | {
      type: 'proposal/FETCH_SUCCEEDED',
      proposals: Array<Object>,
      count: number,
    }
  | {
      type: 'proposal/POSTS_FETCH_SUCCEEDED',
      posts: Array<Object>,
      proposalId: Uuid,
    };

export function* saga(): Generator<*, *, *> {
  yield [
    takeEvery('proposal/CHANGE_FILTER', storeFiltersInLocalStorage),
    takeEvery('proposal/CHANGE_TERMS', storeTermsInLocalStorage),
    takeEvery('proposal/CHANGE_ORDER', storeOrderInLocalStorage),
  ];
}

export const reducer = (state: State = initialState, action: Action): Exact<State> => {
  switch (action.type) {
    case 'proposal/CHANGE_FILTER': {
      const filters = { ...state.filters, [action.filter]: action.value };
      return { ...state, filters };
    }
    case 'proposal/OPEN_CREATE_FUSION_MODAL':
      return { ...state, isCreatingFusion: true };
    case 'proposal/CLOSE_CREATE_FUSION_MODAL':
      return { ...state, isCreatingFusion: false };
    case 'proposal/CHANGE_ORDER':
      return { ...state, order: action.order };
    case 'proposal/CHANGE_TERMS':
      return { ...state, terms: action.terms };
    case 'proposal/OPEN_EDIT_MODAL':
      return { ...state, showEditModal: true };
    case 'proposal/CLOSE_EDIT_MODAL':
      return { ...state, showEditModal: false, isEditing: false };
    case 'proposal/OPEN_DELETE_MODAL':
      return { ...state, showDeleteModal: true };
    case 'proposal/CLOSE_DELETE_MODAL':
      return { ...state, showDeleteModal: false, isDeleting: false };
    case 'proposal/OPEN_CREATE_MODAL':
      return { ...state, showCreateModal: true };
    case 'proposal/CLOSE_CREATE_MODAL':
      return { ...state, showCreateModal: false };
    case 'proposal/OPEN_VOTE_MODAL':
      return { ...state, currentVoteModal: action.id };
    case 'proposal/CLOSE_VOTE_MODAL':
      return { ...state, currentVoteModal: null, isVoting: false };
    case 'proposal/VOTE_REQUESTED':
      return { ...state, isVoting: true };
    case 'proposal/VOTE_FAILED':
      return { ...state, isVoting: false };
    case 'proposal/DELETE_REQUEST':
      return { ...state, isDeleting: true };
    case 'proposal/CHANGE_PROPOSAL_LIST_VIEW': {
      return { ...state, selectedViewByStep: action.mode };
    }
    case 'proposal/OPEN_DETAIL_LIKERS_MODAL':
      return { ...state, showDetailLikersModal: action.id };
    case 'proposal/CLOSE_DETAIL_LIKERS_MODAL':
      return { ...state, showDetailLikersModal: null };
    default:
      return state;
  }
};
