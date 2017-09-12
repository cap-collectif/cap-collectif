// @flow
import { takeEvery, select, call, put } from 'redux-saga/effects';
import flatten from 'flat';
import { SubmissionError } from 'redux-form';
import LocalStorageService from '../../services/LocalStorageService';
import Fetcher, { json } from '../../services/Fetcher';
import FluxDispatcher from '../../dispatchers/AppDispatcher';
import { UPDATE_ALERT } from '../../constants/AlertConstants';
import { CREATE_COMMENT_SUCCESS } from '../../constants/CommentConstants';
import { PROPOSAL_PAGINATION, PROPOSAL_ORDER_RANDOM } from '../../constants/ProposalConstants';
import type { Exact, State as GlobalState, Dispatch, Uuid, Action } from '../../types';

type Status = { name: string, id: number, color: string };
type ChangeFilterAction = {
  type: 'proposal/CHANGE_FILTER',
  filter: string,
  value: string,
};
type ChangeOrderAction = { type: 'proposal/CHANGE_ORDER', order: string };
type SubmitFusionFormAction = {
  type: 'proposal/SUBMIT_FUSION_FORM',
  proposalForm: number,
};
type FetchVotesRequestedAction = {
  type: 'proposal/VOTES_FETCH_REQUESTED',
  stepId: Uuid,
  proposalId: number,
};
type LoadSelectionsAction = {
  type: 'proposal/LOAD_SELECTIONS_REQUEST',
  proposalId: number,
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
type CancelSubmitFusionFormAction = {
  type: 'proposal/CANCEL_SUBMIT_FUSION_FORM',
};
type OpenVotesModalAction = {
  type: 'proposal/OPEN_VOTES_MODAL',
  stepId: Uuid,
};
type CloseVotesModalActionAction = {
  type: 'proposal/CLOSE_VOTES_MODAL',
  stepId: Uuid,
};
type VoteSuccessAction = {
  type: 'proposal/VOTE_SUCCEEDED',
  proposalId: number,
  stepId: Uuid,
  vote: Object,
  comment: Object,
};
type RequestLoadVotesAction = {
  type: 'proposal/VOTES_FETCH_REQUESTED',
  stepId: Uuid,
  proposalId: number,
};
type DeleteVoteSucceededAction = {
  type: 'proposal/DELETE_VOTE_SUCCEEDED',
  proposalId: number,
  stepId: Uuid,
  vote: Object,
};
type RequestDeleteProposalVoteAction = {
  type: 'proposal/DELETE_VOTE_REQUESTED',
  proposalId: number,
};
type CloseEditProposalModalAction = { type: 'proposal/CLOSE_EDIT_MODAL' };
type OpenEditProposalModalAction = { type: 'proposal/OPEN_EDIT_MODAL' };
type CloseDeleteProposalModalAction = { type: 'proposal/CLOSE_DELETE_MODAL' };
type OpenDeleteProposalModalAction = { type: 'proposal/OPEN_DELETE_MODAL' };
type SubmitProposalFormAction = { type: 'proposal/SUBMIT_PROPOSAL_FORM' };
type EditProposalFormAction = { type: 'proposal/EDIT_PROPOSAL_FORM' };
type OpenCreateModalAction = { type: 'proposal/OPEN_CREATE_MODAL' };
type CancelSubmitProposalAction = { type: 'proposal/CANCEL_SUBMIT_PROPOSAL' };
type CloseCreateModalAction = { type: 'proposal/CLOSE_CREATE_MODAL' };
type OpenVoteModalAction = { type: 'proposal/OPEN_VOTE_MODAL', id: number };
type CloseVoteModalAction = { type: 'proposal/CLOSE_VOTE_MODAL' };
type ChangePageAction = { type: 'proposal/CHANGE_PAGE', page: number };
type ChangeTermAction = { type: 'proposal/CHANGE_TERMS', terms: string };
type RequestLoadProposalsAction = {
  type: 'proposal/FETCH_REQUESTED',
  step: ?number,
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
type Proposal = {
  selections: Array<Selection>,
  votesByStepId: { [id: Uuid]: Array<Object> },
} & Object;
type ProposalMap = { [id: number]: Proposal };
export type State = {
  +queryCount: ?number,
  +currentProposalId: ?number,
  +proposalShowedId: Array<number>,
  +creditsLeftByStepId: Object,
  +proposalsById: ProposalMap,
  +userVotesByStepId: Object,
  +currentVotesModal: ?Object,
  +currentVoteModal: ?number,
  +currentDeletingVote: ?number,
  +showCreateModal: boolean,
  +isCreating: boolean,
  +isCreatingFusion: boolean,
  +isSubmittingFusion: boolean,
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
  +lastEditedProposalId: ?number,
  +lastNotifiedStepId: ?Uuid,
  +selectedViewByStep: string,
  +markers: ?Object,
};

const initialState: State = {
  currentProposalId: null,
  proposalShowedId: [],
  queryCount: undefined,
  creditsLeftByStepId: {},
  proposalsById: {},
  lastEditedStepId: null,
  userVotesByStepId: {},
  currentVotesModal: null,
  currentVoteModal: null,
  currentDeletingVote: null,
  showCreateModal: false,
  isCreating: false,
  isCreatingFusion: false,
  isSubmittingFusion: false,
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
export const submitFusionForm = (proposalForm: number): SubmitFusionFormAction => ({
  type: 'proposal/SUBMIT_FUSION_FORM',
  proposalForm,
});
export const cancelSubmitFusionForm = (): CancelSubmitFusionFormAction => ({
  type: 'proposal/CANCEL_SUBMIT_FUSION_FORM',
});
export const openVotesModal = (stepId: Uuid): OpenVotesModalAction => ({
  type: 'proposal/OPEN_VOTES_MODAL',
  stepId,
});
export const closeVotesModal = (stepId: Uuid): CloseVotesModalActionAction => ({
  type: 'proposal/CLOSE_VOTES_MODAL',
  stepId,
});
export const voteSuccess = (
  proposalId: number,
  stepId: Uuid,
  vote: Object,
  comment: Object,
): VoteSuccessAction => ({
  type: 'proposal/VOTE_SUCCEEDED',
  proposalId,
  stepId,
  vote,
  comment,
});
export const loadVotes = (stepId: Uuid, proposalId: number): RequestLoadVotesAction => ({
  type: 'proposal/VOTES_FETCH_REQUESTED',
  stepId,
  proposalId,
});
export const deleteVoteSucceeded = (
  stepId: Uuid,
  proposalId: number,
  vote: Object,
): DeleteVoteSucceededAction => ({
  type: 'proposal/DELETE_VOTE_SUCCEEDED',
  proposalId,
  stepId,
  vote,
});
const deleteVoteRequested = (proposalId: number): RequestDeleteProposalVoteAction => ({
  type: 'proposal/DELETE_VOTE_REQUESTED',
  proposalId,
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
export const submitProposalForm = (): SubmitProposalFormAction => ({
  type: 'proposal/SUBMIT_PROPOSAL_FORM',
});
export const editProposalForm = (): EditProposalFormAction => ({
  type: 'proposal/EDIT_PROPOSAL_FORM',
});
export const openCreateModal = (): OpenCreateModalAction => ({
  type: 'proposal/OPEN_CREATE_MODAL',
});
export const cancelSubmitProposal = (): CancelSubmitProposalAction => ({
  type: 'proposal/CANCEL_SUBMIT_PROPOSAL',
});
export const closeCreateModal = (): CloseCreateModalAction => ({
  type: 'proposal/CLOSE_CREATE_MODAL',
});
export const openVoteModal = (id: number): OpenVoteModalAction => ({
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
  step: ?number,
  regenerateRandomOrder: ?boolean,
): RequestLoadProposalsAction => ({
  type: 'proposal/FETCH_REQUESTED',
  step,
  regenerateRandomOrder,
});
export const deleteProposal = (form: number, proposal: Object, dispatch: Dispatch): void => {
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

export const vote = (dispatch: Dispatch, step: Object, proposal: Object, data: Object) => {
  let url = '';
  switch (step.type) {
    case 'selection':
      url = `/selection_steps/${step.id}/proposals/${proposal.id}/votes`;
      break;
    case 'collect':
      url = `/collect_steps/${step.id}/proposals/${proposal.id}/votes`;
      break;
    default:
      console.log('unknown step'); // eslint-disable-line no-console
      return false;
  }
  dispatch(startVoting());
  return Fetcher.postToJson(url, data)
    .then(newVote => {
      dispatch(voteSuccess(proposal.id, step.id, newVote, data.comment));
      if (data.comment) {
        FluxDispatcher.dispatch({
          actionType: CREATE_COMMENT_SUCCESS,
          message: null,
        });
      }
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: { bsStyle: 'success', content: 'proposal.request.vote.success' },
      });
    })
    .catch(({ response }) => {
      if (response.message === 'Validation Failed') {
        dispatch(stopVoting());
        if (typeof response.errors.children.email === 'object') {
          throw new SubmissionError({
            _error: response.errors.children.email.errors[0],
          });
        }
      }
      dispatch(closeVoteModal());
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: { bsStyle: 'danger', content: 'proposal.request.vote.failure' },
      });
    });
};

export const deleteVote = (dispatch: Dispatch, step: Object, proposal: Object) => {
  dispatch(deleteVoteRequested(proposal.id));
  let url = '';
  switch (step.type) {
    case 'selection':
      url = `/selection_steps/${step.id}/proposals/${proposal.id}/votes`;
      break;
    case 'collect':
      url = `/collect_steps/${step.id}/proposals/${proposal.id}/votes`;
      break;
    default:
      console.log('unknown step'); // eslint-disable-line no-console
      return;
  }
  return Fetcher.delete(url)
    .then(json)
    .then(v => {
      dispatch(deleteVoteSucceeded(step.id, proposal.id, v));
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

export const submitProposal = (dispatch: Dispatch, form: number, data: Object): Promise<*> => {
  const formData = new FormData();
  const flattenedData = flatten(data);
  Object.keys(flattenedData).map(key => {
    if (flattenedData[key] !== -1) {
      formData.append(key, flattenedData[key]);
    }
  });
  return Fetcher.postFormData(`/proposal_forms/${form}/proposals`, formData)
    .then(response => {
      dispatch(closeCreateModal());

      response.json().then(proposal => {
        FluxDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: {
            bsStyle: 'success',
            content: 'proposal.request.create.success',
          },
        });

        window.location.href = proposal._links.show;
      });
    })
    .catch(() => {
      dispatch(cancelSubmitProposal());
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          bsStyle: 'warning',
          content: 'proposal.request.create.failure',
        },
      });
    });
};

export const updateProposal = (dispatch: Dispatch, form: number, id: number, data: Object) => {
  const formData = new FormData();
  const flattenedData = flatten(data);
  Object.keys(flattenedData).map(key => formData.append(key, flattenedData[key]));
  return Fetcher.postFormData(`/proposal_forms/${form}/proposals/${id}`, formData)
    .then(() => {
      dispatch(closeEditProposalModal());
      location.reload();
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: { bsStyle: 'success', content: 'alert.success.update.proposal' },
      });
    })
    .catch(() => {
      dispatch(cancelSubmitProposal());
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          bsStyle: 'warning',
          content: 'proposal.request.update.failure',
        },
      });
    });
};

export function* fetchVotesByStep(action: FetchVotesRequestedAction): Generator<*, *, *> {
  const { stepId, proposalId } = action;
  try {
    let hasMore = true;
    let iterationCount = 0;
    const votesPerIteration = 50;
    while (hasMore) {
      const result = yield call(
        Fetcher.get,
        `/steps/${stepId}/proposals/${proposalId}/votes?offset=${iterationCount *
          votesPerIteration}&limit=${votesPerIteration}`,
      );
      hasMore = result.hasMore;
      iterationCount++;
      yield put({
        type: 'proposal/VOTES_FETCH_SUCCEEDED',
        votes: result.votes,
        stepId,
        proposalId,
      });
    }
  } catch (e) {
    yield put({ type: 'proposal/VOTES_FETCH_FAILED', error: e });
  }
}

function* submitFusionFormData(action: SubmitFusionFormAction): Generator<*, *, *> {
  const { proposalForm } = action;
  const globalState: GlobalState = yield select();
  const formData = new FormData();
  const data = { ...globalState.form.proposal.values };
  delete data.project;
  if (data.responses.length === 0) {
    delete data.responses;
  }
  data.childConnections = data.childConnections.map(u => u.value);
  const flattenedData = flatten(data);
  Object.keys(flattenedData).map(key => {
    formData.append(key, flattenedData[key]);
  });
  try {
    yield call(Fetcher.postFormData, `/proposal_forms/${proposalForm}/proposals`, formData);
    yield put(closeCreateFusionModal());
    location.reload();
  } catch (e) {
    yield put(cancelSubmitFusionForm());
  }
}

export function* fetchProposals(action: Object): Generator<*, *, *> {
  let { step } = action;
  const { regenerateRandomOrder } = action;

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
  let lastProposals = {};

  // Valid 24 hours
  if (LocalStorageService.isValid('proposal.randomResultsByStep', 86400000)) {
    lastProposals = LocalStorageService.get('proposal.randomResultsByStep');
  }

  // If order is random & proposals are stored in Local Storage -> get last results
  if (
    (!state.order || state.order === PROPOSAL_ORDER_RANDOM) &&
    !regenerateRandomOrder &&
    (!state.terms || state.terms === true) &&
    (!state.filters || Object.keys(state.filters).length === 0) &&
    lastProposals[step.id]
  ) {
    switch (step.type) {
      case 'collect':
        url = `/collect_steps/${step.id}/proposals/search-in`;
        break;
      case 'selection':
        url = `/selection_steps/${step.id}/proposals/search-in`;
        break;
      default:
        console.log('Unknown step type'); // eslint-disable-line no-console
        return false;
    }

    body = { ids: lastProposals[step.id] };
  } else {
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
    const order = state.order ? state.order : PROPOSAL_ORDER_RANDOM;
    url += `?page=${state.currentPaginationPage}&pagination=${PROPOSAL_PAGINATION}&order=${order}`;
    body = { terms: state.terms, filters: state.filters };
  }

  const result = yield call(Fetcher.postToJson, url, body);

  // Save results to localStorage if selected order is random
  if (
    (result.order === PROPOSAL_ORDER_RANDOM || !result.order) &&
    (!state.terms || state.terms === true) &&
    (!state.filters || Object.keys(state.filters).length === 0)
  ) {
    lastProposals[step.id] = result.proposals.map(proposal => proposal.id);

    LocalStorageService.set('proposal.randomResultsByStep', lastProposals);
  }

  yield put({
    type: 'proposal/FETCH_SUCCEEDED',
    proposals: result.proposals,
    count: result.count,
  });
}

type FetchVotesSucceededAction = {
  type: 'proposal/VOTES_FETCH_SUCCEEDED',
  stepId: Uuid,
  votes: Array<Object>,
  proposalId: number,
};
type RequestFetchProposalPostsAction = {
  type: 'proposal/POSTS_FETCH_REQUESTED',
  proposalId: number,
};
export const fetchProposalPosts = (proposalId: number): RequestFetchProposalPostsAction => ({
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
  | FetchVotesRequestedAction
  | SubmitFusionFormAction
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
  | OpenVotesModalAction
  | CancelSubmitProposalAction
  | SubmitProposalFormAction
  | OpenDeleteProposalModalAction
  | RequestFetchProposalPostsAction
  | DeleteVoteSucceededAction
  | LoadSelectionsAction
  | CloseEditProposalModalAction
  | RequestDeleteProposalVoteAction
  | CloseVoteModalAction
  | VoteSuccessAction
  | CloseDeleteProposalModalAction
  | RequestDeleteAction
  | ChangeProposalListViewAction
  | LoadMarkersAction;

export function* saga(): Generator<*, *, *> {
  yield [
    takeEvery('proposal/POSTS_FETCH_REQUESTED', fetchPosts),
    takeEvery('proposal/VOTES_FETCH_REQUESTED', fetchVotesByStep),
    takeEvery('proposal/FETCH_REQUESTED', fetchProposals),
    takeEvery('proposal/SUBMIT_FUSION_FORM', submitFusionFormData),
    takeEvery('proposal/LOAD_MARKERS_REQUEST', fetchMarkers),
    takeEvery('proposal/CHANGE_FILTER', storeFiltersInLocalStorage),
    takeEvery('proposal/CHANGE_ORDER', storeOrderInLocalStorage),
  ];
}

const voteReducer = (state: State, action): Exact<State> => {
  const proposal = state.proposalsById[action.proposalId];
  const votesByStepId = proposal.votesByStepId || {};
  votesByStepId[action.stepId].unshift(action.vote);
  const votesCountByStepId = proposal.votesCountByStepId;
  votesCountByStepId[action.stepId]++;
  let commentsCount = proposal.comments_count;
  if (action.comment) {
    commentsCount++;
  }
  const proposalsById = state.proposalsById;
  const userVotesByStepId = state.userVotesByStepId;
  userVotesByStepId[action.stepId].push(proposal.id);
  proposalsById[action.proposalId] = {
    ...proposal,
    votesCountByStepId,
    votesByStepId,
    comments_count: commentsCount,
  };
  const creditsLeftByStepId = state.creditsLeftByStepId;
  creditsLeftByStepId[action.stepId] -= proposal.estimation || 0;
  return {
    ...state,
    proposalsById,
    userVotesByStepId,
    isVoting: false,
    currentVoteModal: null,
    creditsLeftByStepId,
  };
};
const deleteVoteReducer = (state: State, action): Exact<State> => {
  const proposal = state.proposalsById[action.proposalId];
  if (!proposal) {
    const userVotesByStepId = state.userVotesByStepId;
    userVotesByStepId[action.stepId] = userVotesByStepId[action.stepId].filter(
      voteId => voteId !== action.proposalId,
    );
    return { ...state, userVotesByStepId };
  } // Fix for user votes page
  const votesCountByStepId = proposal.votesCountByStepId;
  votesCountByStepId[action.stepId]--;
  const votesByStepId = proposal.votesByStepId || [];
  if (action.vote.user) {
    votesByStepId[action.stepId] = votesByStepId[action.stepId].filter(
      v => !v.user || v.user.uniqueId !== action.vote.user.uniqueId,
    );
  } else {
    votesByStepId[action.stepId].slice(
      votesByStepId[action.stepId].findIndex(v => v.user === null),
      1,
    );
  }
  const proposalsById = state.proposalsById;
  const userVotesByStepId = state.userVotesByStepId;
  userVotesByStepId[action.stepId] = userVotesByStepId[action.stepId].filter(
    voteId => voteId !== action.proposalId,
  );
  proposalsById[action.proposalId] = {
    ...proposal,
    votesCountByStepId,
    votesByStepId,
  };
  const creditsLeftByStepId = state.creditsLeftByStepId;
  creditsLeftByStepId[action.stepId] += proposal.estimation || 0;
  return {
    ...state,
    proposalsById,
    userVotesByStepId,
    creditsLeftByStepId,
    isVoting: false,
    currentDeletingVote: null,
  };
};

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

const fetchVotesSucceedReducer = (
  state: State,
  action: FetchVotesSucceededAction,
): Exact<State> => {
  const proposal = state.proposalsById[action.proposalId];
  const votesByStepId = proposal.votesByStepId || [];
  votesByStepId[action.stepId] = action.votes;
  const proposalsById = state.proposalsById;
  proposalsById[action.proposalId] = { ...proposal, votesByStepId };
  return { ...state, proposalsById };
};

export const reducer = (state: State = initialState, action: Action): Exact<State> => {
  switch (action.type) {
    case '@@INIT':
      return { ...initialState, ...state };
    case 'proposal/CHANGE_FILTER': {
      const filters = { ...state.filters, [action.filter]: action.value };
      return { ...state, filters, currentPaginationPage: 1 };
    }
    case 'proposal/OPEN_CREATE_FUSION_MODAL':
      return { ...state, isCreatingFusion: true };
    case 'proposal/CLOSE_CREATE_FUSION_MODAL':
      return { ...state, isCreatingFusion: false };
    case 'proposal/SUBMIT_FUSION_FORM':
      return { ...state, isSubmittingFusion: true };
    case 'proposal/CANCEL_SUBMIT_FUSION_FORM':
      return { ...state, isSubmittingFusion: false };
    case 'proposal/OPEN_VOTES_MODAL':
      return {
        ...state,
        currentVotesModal: {
          proposalId: state.currentProposalId,
          stepId: action.stepId,
        },
      };
    case 'proposal/CLOSE_VOTES_MODAL':
      return { ...state, currentVotesModal: null };
    case 'proposal/CHANGE_ORDER':
      return { ...state, order: action.order, currentPaginationPage: 1 };
    case 'proposal/CHANGE_PAGE':
      return { ...state, currentPaginationPage: action.page };
    case 'proposal/CHANGE_TERMS':
      return { ...state, terms: action.terms, currentPaginationPage: 1 };
    case 'proposal/SUBMIT_PROPOSAL_FORM':
      return { ...state, isCreating: true };
    case 'proposal/CANCEL_SUBMIT_PROPOSAL':
      return { ...state, isCreating: false, isEditing: false };
    case 'proposal/EDIT_PROPOSAL_FORM':
      return { ...state, isEditing: true };
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
      return { ...state, showCreateModal: false, isCreating: false };
    case 'proposal/OPEN_VOTE_MODAL':
      return { ...state, currentVoteModal: action.id };
    case 'proposal/CLOSE_VOTE_MODAL':
      return { ...state, currentVoteModal: null, isVoting: false };
    case 'proposal/VOTE_REQUESTED':
      return { ...state, isVoting: true };
    case 'proposal/VOTE_FAILED':
      return { ...state, isVoting: false };
    case 'proposal/DELETE_VOTE_REQUESTED':
      return { ...state, currentDeletingVote: action.proposalId };
    case 'proposal/VOTE_SUCCEEDED':
      return voteReducer(state, action);
    case 'proposal/DELETE_VOTE_SUCCEEDED':
      return deleteVoteReducer(state, action);
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
    case 'proposal/VOTES_FETCH_SUCCEEDED':
      return fetchVotesSucceedReducer(state, action);
    case 'proposal/POSTS_FETCH_FAILED': {
      console.log('proposal/POSTS_FETCH_FAILED', action.error); // eslint-disable-line no-console
      return state;
    }
    case 'proposal/SEND_PROPOSAL_NOTIFICATION_SUCCEED': {
      return { ...state, lastNotifiedStepId: action.stepId };
    }
    case 'proposal/SEND_PROPOSAL_NOTIFICATION_ERROR': {
      console.log('proposal/SEND_PROPOSAL_NOTIFICATION_ERROR', action.error); // eslint-disable-line no-console
      return state;
    }
    case 'proposal/CHANGE_PROPOSAL_LIST_VIEW': {
      return { ...state, selectedViewByStep: action.mode };
    }
    default:
      return state;
  }
};
