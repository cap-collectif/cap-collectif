// @flow
import { takeEvery, select, call, put } from 'redux-saga/effects';
import LocalStorageService from '../../services/LocalStorageService';
import Fetcher from '../../services/Fetcher';
import FluxDispatcher from '../../dispatchers/AppDispatcher';
import { UPDATE_ALERT } from '../../constants/AlertConstants';
import { PROPOSAL_PAGINATION, PROPOSAL_ORDER_RANDOM } from '../../constants/ProposalConstants';
import addVote from '../../mutations/AddProposalVoteMutation';
import removeVote from '../../mutations/RemoveProposalVoteMutation';
import type { Exact, State as GlobalState, Dispatch, Uuid, Action } from '../../types';

type Status = { name: string, id: number, color: string };
type ChangeFilterAction = {
  type: 'proposal/CHANGE_FILTER',
  filter: string,
  value: string,
};
type ChangeOrderAction = { type: 'proposal/CHANGE_ORDER', order: string };

type FetchVotesRequestedAction = {
  type: 'proposal/VOTES_FETCH_REQUESTED',
  stepId: Uuid,
  proposalId: Uuid,
};
type LoadSelectionsAction = {
  type: 'proposal/LOAD_SELECTIONS_REQUEST',
  proposalId: Uuid,
};
type LoadMarkersAction = {
  type: 'proposal/LOAD_MARKERS_REQUEST',
  stepType: string,
  stepId: Uuid,
};
type LoadMarkersSuccessAction = {
  type: 'proposal/LOAD_MARKERS_SUCCEEDED',
  markers: Object,
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
type RequestLoadProposalsAction = {
  type: 'proposal/FETCH_REQUESTED',
  step: ?Uuid,
  regenerateRandomOrder: ?boolean,
};
type RequestVotingAction = { type: 'proposal/VOTE_REQUESTED' };
type VoteFailedAction = { type: 'proposal/VOTE_FAILED' };
type ChangeProposalListViewAction = {
  type: 'proposal/CHANGE_PROPOSAL_LIST_VIEW',
  mode: string,
};
type Step = {
  type?: string,
  statuses?: Array<Status>,
  id: Uuid,
};
type Selection = { step: Step, status: ?Status };
export type Proposal = {
  selections: Array<Selection>,
  votesCountByStepId: { [id: Uuid]: number },
  viewerCanSeeEvaluation: boolean,
} & Object;
type ProposalMap = { [id: Uuid]: Proposal };
export type State = {
  +queryCount: ?number,
  +currentProposalId: ?Uuid,
  +proposalShowedId: Array<Uuid>,
  +proposalsById: ProposalMap,
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
  +currentPaginationPage: number,
  +lastEditedProposalId: ?Uuid,
  +lastNotifiedStepId: ?Uuid,
  +selectedViewByStep: string,
  +markers: ?Object,
  +referer: ?string,
};

export const initialState: State = {
  currentProposalId: null,
  proposalShowedId: [],
  queryCount: undefined,
  proposalsById: {},
  lastEditedStepId: null,
  userVotesByStepId: {},
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
  currentPaginationPage: 1,
  lastEditedProposalId: null,
  lastNotifiedStepId: null,
  selectedViewByStep: 'mosaic',
  markers: null,
  referer: null,
};

export const loadMarkers = (stepId: Uuid, stepType: string): LoadMarkersAction => ({
  type: 'proposal/LOAD_MARKERS_REQUEST',
  stepType,
  stepId,
});

export const loadMarkersSuccess = (markers: Object): LoadMarkersSuccessAction => ({
  type: 'proposal/LOAD_MARKERS_SUCCEEDED',
  markers,
});

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
export const changeProposalListView = (mode: string): ChangeProposalListViewAction => ({
  type: 'proposal/CHANGE_PROPOSAL_LIST_VIEW',
  mode,
});

type RequestDeleteAction = { type: 'proposal/DELETE_REQUEST' };
const deleteRequest = (): RequestDeleteAction => ({
  type: 'proposal/DELETE_REQUEST',
});
export const loadProposals = (
  step: ?Uuid,
  regenerateRandomOrder: ?boolean,
): RequestLoadProposalsAction => ({
  type: 'proposal/FETCH_REQUESTED',
  step,
  regenerateRandomOrder,
});
export const deleteProposal = (form: Uuid, proposal: Object, dispatch: Dispatch): void => {
  dispatch(deleteRequest());
  Fetcher.delete(`/proposal_forms/${form}/proposals/${proposal.id}`)
    .then(() => {
      dispatch(closeDeleteProposalModal());
      window.location.href = proposal._links.index;
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
          content: 'proposal.request.delete.failure',
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

export const addProposalInRandomResultsByStep = (
  proposal: { +id: string },
  currentProjectStepId: string,
) => {
  if (LocalStorageService.isValid('proposal.randomResultsByStep')) {
    const randomResultsByStep = LocalStorageService.get('proposal.randomResultsByStep');
    const lastProposals = randomResultsByStep[currentProjectStepId];

    if (lastProposals.indexOf(proposal.id) !== -1) {
      return;
    }

    const proposals = {};
    proposals[currentProjectStepId] = [proposal.id, ...lastProposals];

    LocalStorageService.set('proposal.randomResultsByStep', {
      ...randomResultsByStep,
      ...proposals,
    });
  }
};

export const vote = (dispatch: Dispatch, step: Object, proposal: Object, data: Object) => {
  dispatch(startVoting());
  return addVote
    .commit({
      step: step.id,
      withVotes: true,
      input: { proposalId: proposal.id, stepId: step.id, anonymously: data.private },
    })
    .then(() => {
      dispatch(closeVoteModal());
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: { bsStyle: 'success', content: 'proposal.request.vote.success' },
      });
    })
    .catch(e => {
      console.error(e);
      dispatch(closeVoteModal());
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: { bsStyle: 'danger', content: 'proposal.request.vote.failure' },
      });
    });
};

export const deleteVote = (dispatch: Dispatch, step: Object, proposal: Object) => {
  return removeVote
    .commit({ withVotes: true, step: step.id, input: { proposalId: proposal.id, stepId: step.id } })
    .then(() => {
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          bsStyle: 'success',
          content: 'proposal.request.delete_vote.success',
        },
      });
    })
    .catch(e => {
      console.log(e); // eslint-disable-line no-console
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          bsStyle: 'warning',
          content: 'proposal.request.delete_vote.failure',
        },
      });
    });
};

export function* fetchProposals(action: Object): Generator<*, *, *> {
  let { step } = action;

  const globalState: GlobalState = yield select();
  if (globalState.project.currentProjectById) {
    step =
      step ||
      globalState.project.projectsById[globalState.project.currentProjectById].stepsById[
        globalState.project.currentProjectStepById
      ];
  }
  const state = globalState.proposal;
  let url = '';
  let body = {};

  switch (step.type) {
    case 'collect':
      url = `/collect_steps/${step.id}/proposals/search`;
      break;
    case 'selection':
      url = `/selection_steps/${step.id}/proposals/search`;
      break;
    default:
      console.log('Unknown step type'); // eslint-disable-line no-console
      return false;
  }

  const filters = {};
  if (state.filters) {
    Object.keys(state.filters).forEach(key => {
      if (state.filters[key] && state.filters[key] !== '0') {
        filters[key] = state.filters[key];
      }
    });
  }

  const order = state.order ? state.order : PROPOSAL_ORDER_RANDOM;
  url += `?page=${state.currentPaginationPage}&pagination=${PROPOSAL_PAGINATION}&order=${order}`;
  body = { terms: state.terms, filters };

  const result = yield call(Fetcher.postToJson, url, body);

  yield put({
    type: 'proposal/FETCH_SUCCEEDED',
    proposals: result.proposals,
    count: result.count,
  });
}

type RequestFetchProposalPostsAction = {
  type: 'proposal/POSTS_FETCH_REQUESTED',
  proposalId: Uuid,
};
export const fetchProposalPosts = (proposalId: Uuid): RequestFetchProposalPostsAction => ({
  type: 'proposal/POSTS_FETCH_REQUESTED',
  proposalId,
});

export function* fetchPosts(action: RequestFetchProposalPostsAction): Generator<*, *, *> {
  try {
    const result = yield call(Fetcher.get, `/proposals/${action.proposalId}/posts`);
    yield put({
      type: 'proposal/POSTS_FETCH_SUCCEEDED',
      posts: result.posts,
      proposalId: action.proposalId,
    });
  } catch (e) {
    yield put({ type: 'proposal/POSTS_FETCH_FAILED', error: e });
  }
}

export function* fetchMarkers(action: LoadMarkersAction): Generator<*, *, *> {
  try {
    const markers = yield call(Fetcher.get, `/${action.stepType}_step/${action.stepId}/markers`);
    yield put({
      type: 'proposal/LOAD_MARKERS_SUCCEEDED',
      markers,
    });
  } catch (e) {
    console.log(e); // eslint-disable-line
  }
}

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
  | FetchVotesRequestedAction
  | ChangeFilterAction
  | VoteFailedAction
  | RequestVotingAction
  | RequestLoadProposalsAction
  | ChangeTermAction
  | ChangeOrderAction
  | OpenDeleteProposalModalAction
  | ChangePageAction
  | CloseCreateModalAction
  | OpenVoteModalAction
  | OpenDeleteProposalModalAction
  | RequestFetchProposalPostsAction
  | LoadSelectionsAction
  | CloseEditProposalModalAction
  | CloseVoteModalAction
  | CloseDeleteProposalModalAction
  | RequestDeleteAction
  | ChangeProposalListViewAction
  | LoadMarkersAction
  | OpenCreateFusionModalAction
  | CloseCreateFusionModalAction
  | OpenEditProposalModalAction
  | LoadMarkersSuccessAction
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
    takeEvery('proposal/POSTS_FETCH_REQUESTED', fetchPosts),
    takeEvery('proposal/FETCH_REQUESTED', fetchProposals),
    takeEvery('proposal/LOAD_MARKERS_REQUEST', fetchMarkers),
    takeEvery('proposal/CHANGE_FILTER', storeFiltersInLocalStorage),
    takeEvery('proposal/CHANGE_TERMS', storeTermsInLocalStorage),
    takeEvery('proposal/CHANGE_ORDER', storeOrderInLocalStorage),
  ];
}

const fetchSucceededReducer = (state: State, action): Exact<State> => {
  const proposalsById = action.proposals.reduce((map, obj) => {
    map[obj.id] = obj;
    return map;
  }, {});
  const proposalShowedId = action.proposals.map(proposal => proposal.id);
  return {
    ...state,
    proposalsById,
    proposalShowedId,
    isLoading: false,
    queryCount: action.count,
  };
};

export const reducer = (state: State = initialState, action: Action): Exact<State> => {
  switch (action.type) {
    case 'proposal/CHANGE_FILTER': {
      const filters = { ...state.filters, [action.filter]: action.value };
      return { ...state, filters, currentPaginationPage: 1 };
    }
    case 'proposal/OPEN_CREATE_FUSION_MODAL':
      return { ...state, isCreatingFusion: true };
    case 'proposal/CLOSE_CREATE_FUSION_MODAL':
      return { ...state, isCreatingFusion: false };
    case 'proposal/CHANGE_ORDER':
      return { ...state, order: action.order, currentPaginationPage: 1 };
    case 'proposal/CHANGE_PAGE':
      return { ...state, currentPaginationPage: action.page };
    case 'proposal/CHANGE_TERMS':
      return { ...state, terms: action.terms, currentPaginationPage: 1 };
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
    case 'proposal/FETCH_REQUESTED':
      return { ...state, isLoading: true };
    case 'proposal/FETCH_SUCCEEDED':
      return fetchSucceededReducer(state, action);
    case 'proposal/LOAD_MARKERS_SUCCEEDED': {
      return { ...state, markers: action.markers };
    }
    case 'proposal/POSTS_FETCH_SUCCEEDED': {
      const posts = action.posts;
      const proposalsById = state.proposalsById;
      proposalsById[action.proposalId] = {
        ...state.proposalsById[action.proposalId],
        posts,
      };
      return { ...state, proposalsById };
    }
    case 'proposal/POSTS_FETCH_FAILED': {
      console.log('proposal/POSTS_FETCH_FAILED', action.error); // eslint-disable-line no-console
      return state;
    }
    case 'proposal/CHANGE_PROPOSAL_LIST_VIEW': {
      return { ...state, selectedViewByStep: action.mode };
    }
    default:
      return state;
  }
};
