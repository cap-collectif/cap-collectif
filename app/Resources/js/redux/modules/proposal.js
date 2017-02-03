// @flow
import type { Dispatch as ReduxDispatch } from 'redux';
import { takeEvery } from 'redux-saga';
import { select, call, put } from 'redux-saga/effects';
import flatten from 'flat';
import { SubmissionError } from 'redux-form';
import LocalStorageService from '../../services/LocalStorageService';
import Fetcher, { json } from '../../services/Fetcher';
import FluxDispatcher from '../../dispatchers/AppDispatcher';
import { UPDATE_ALERT } from '../../constants/AlertConstants';
import { CREATE_COMMENT_SUCCESS } from '../../constants/CommentConstants';

export const POSTS_FETCH_REQUESTED = 'proposal/POSTS_FETCH_REQUESTED';
export const POSTS_FETCH_SUCCEEDED = 'proposal/POSTS_FETCH_SUCCEEDED';
export const POSTS_FETCH_FAILED = 'proposal/POSTS_FETCH_FAILED';
export const OPEN_CREATE_MODAL = 'proposal/OPEN_CREATE_MODAL';
export const CLOSE_CREATE_MODAL = 'proposal/CLOSE_CREATE_MODAL';
export const FETCH_REQUESTED = 'proposal/FETCH_REQUESTED';
export const FETCH_SUCCEEDED = 'proposal/FETCH_SUCCEEDED';
export const VOTE_REQUESTED = 'proposal/VOTE_REQUESTED';
export const VOTE_SUCCEEDED = 'proposal/VOTE_SUCCEEDED';
export const VOTE_FAILED = 'proposal/VOTE_FAILED';
export const OPEN_VOTE_MODAL = 'proposal/OPEN_VOTE_MODAL';
export const CLOSE_VOTE_MODAL = 'proposal/CLOSE_VOTE_MODAL';
export const VOTES_FETCH_REQUESTED = 'proposal/VOTES_FETCH_REQUESTED';
export const VOTES_FETCH_SUCCEEDED = 'proposal/VOTES_FETCH_SUCCEEDED';
export const VOTES_FETCH_FAILED = 'proposal/VOTES_FETCH_FAILED';
export const DELETE_VOTE_REQUESTED = 'proposal/DELETE_VOTE_REQUESTED';
export const DELETE_VOTE_SUCCEEDED = 'proposal/DELETE_VOTE_SUCCEEDED';
export const DELETE_VOTE_FAILED = 'proposal/DELETE_VOTE_FAILED';
export const PROPOSAL_PAGINATION = 51;
export const CHANGE_PAGE = 'proposal/CHANGE_PAGE';
export const CHANGE_ORDER = 'proposal/CHANGE_ORDER';
export const CHANGE_TERMS = 'proposal/CHANGE_TERMS';
export const CHANGE_FILTER = 'proposal/CHANGE_FILTER';
export const SUBMIT_PROPOSAL_FORM = 'proposal/SUBMIT_PROPOSAL_FORM';
export const OPEN_VOTES_MODAL = 'proposal/OPEN_VOTES_MODAL';
export const CLOSE_VOTES_MODAL = 'proposal/CLOSE_VOTES_MODAL';
export const CLOSE_DELETE_MODAL = 'proposal/CLOSE_DELETE_MODAL';
export const OPEN_DELETE_MODAL = 'proposal/OPEN_DELETE_MODAL';
export const CLOSE_EDIT_MODAL = 'proposal/CLOSE_EDIT_MODAL';
export const OPEN_EDIT_MODAL = 'proposal/OPEN_EDIT_MODAL';
export const CANCEL_SUBMIT_PROPOSAL = 'proposal/CANCEL_SUBMIT_PROPOSAL';
const DELETE_REQUEST = 'proposal/DELETE_REQUEST';
const EDIT_PROPOSAL_FORM = 'proposal/EDIT_PROPOSAL_FORM';
const CLOSE_CREATE_FUSION_MODAL = 'proposal/CLOSE_CREATE_FUSION_MODAL';
const OPEN_CREATE_FUSION_MODAL = 'proposal/OPEN_CREATE_FUSION_MODAL';
const SUBMIT_FUSION_FORM = 'proposa/SUBMIT_FUSION_FORM';
const CANCEL_SUBMIT_FUSION_FORM = 'proposa/CANCEL_SUBMIT_FUSION_FORM';
const LOAD_SELECTIONS_SUCCEEDED = 'proposal/LOAD_SELECTIONS_SUCCEEDED';
const LOAD_SELECTIONS_REQUEST = 'proposal/LOAD_SELECTIONS_REQUEST';
const UNSELECT_SUCCEED = 'proposal/UNSELECT_SUCCEED';
const SELECT_SUCCEED = 'proposal/SELECT_SUCCEED';
const UPDATE_SELECTION_STATUS_SUCCEED = 'proposal/UPDATE_SELECTION_STATUS_SUCCEED';
const UPDATE_PROPOSAL_STATUS_SUCCEED = 'proposal/UPDATE_PROPOSAL_STATUS_SUCCEED';
const SEND_PROPOSAL_NOTIFICATION_SUCCEED = 'proposal/SEND_PROPOSAL_NOTIFICATION_SUCCEED';
const SEND_PROPOSAL_NOTIFICATION_ERROR = 'proposal/SEND_SELECTION_NOTIFICATION_ERROR';

type Status = { id: number };
type ChangeFilterAction = { type: 'proposal/CHANGE_FILTER', filter: string, value: string };
type ChangeOrderAction = { type: 'proposal/CHANGE_ODER', order: string };
type SubmitFusionFormAction = { type: 'proposal/SUBMIT_FUSION_FORM', proposalForm: number };
type FetchVotesRequestedAction = {
  type: 'proposal/VOTES_FETCH_REQUESTED',
  stepId: number,
  proposalId: number
};

type Action =
    { type: 'proposal/SEND_PROPOSAL_NOTIFICATION_SUCCEED', proposalId: number, stepId: number }
  | { type: 'proposal/SEND_PROPOSAL_NOTIFICATION_ERROR', error: string }
  | FetchVotesRequestedAction
  | SubmitFusionFormAction
  | ChangeFilterAction
  | Object
;
// type Step = {
//   type: string,
//   id: number
// };
type ProposalMap = {[id: number]: Object};
export type State = {
  queryCount: ?number,
  currentProposalId: ?number,
  proposalShowedId: Array<number>,
  creditsLeftByStepId: Object,
  proposalsById: ProposalMap,
  userVotesByStepId: Object,
  currentVotesModal: ?Object,
  currentVoteModal: ?number,
  currentDeletingVote: ?number,
  showCreateModal: boolean,
  isCreating: boolean,
  isCreatingFusion: boolean,
  isSubmittingFusion: boolean,
  showDeleteModal: boolean,
  isDeleting: boolean,
  isVoting: boolean,
  isLoading: boolean,
  isEditing: boolean,
  showEditModal: boolean,
  order: string,
  filters: Object,
  terms: ?string,
  currentPaginationPage: number,
  lastEditedProposalId: ?number,
  lastNotifiedStepId: ?number
};
type Dispatch = ReduxDispatch<Action>;

const initialState: State = {
  currentProposalId: null,
  proposalShowedId: [],
  queryCount: undefined,
  creditsLeftByStepId: {},
  proposalsById: {},
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
};

export const loadSelections = (proposalId: number): Action => ({ type: LOAD_SELECTIONS_REQUEST, proposalId });
export const loadSelectionsSucess = (proposalId: number): Action => ({ type: LOAD_SELECTIONS_SUCCEEDED, proposalId });
export const closeCreateFusionModal = (): Action => ({ type: CLOSE_CREATE_FUSION_MODAL });
export const openCreateFusionModal = (): Action => ({ type: OPEN_CREATE_FUSION_MODAL });
export const submitFusionForm = (proposalForm: number): SubmitFusionFormAction => ({ type: 'proposal/SUBMIT_FUSION_FORM', proposalForm });
export const cancelSubmitFusionForm = (): Action => ({ type: CANCEL_SUBMIT_FUSION_FORM });
export const openVotesModal = (stepId: number): Action => ({ type: OPEN_VOTES_MODAL, stepId });
export const closeVotesModal = (stepId: number): Action => ({ type: CLOSE_VOTES_MODAL, stepId });
export const voteSuccess = (proposalId: number, stepId: number, vote: Object, comment: Object): Action => ({
  type: VOTE_SUCCEEDED,
  proposalId,
  stepId,
  vote,
  comment,
});
export const loadVotes = (stepId: number, proposalId: number): Action => ({
  type: VOTES_FETCH_REQUESTED,
  stepId,
  proposalId,
});
export const deleteVoteSucceeded = (stepId: number, proposalId: number, vote: Object): Action => ({ type: DELETE_VOTE_SUCCEEDED, proposalId, stepId, vote });
const deleteVoteRequested = (proposalId: number): Action => ({ type: DELETE_VOTE_REQUESTED, proposalId });
export const closeEditProposalModal = (): Action => ({ type: CLOSE_EDIT_MODAL });
export const openEditProposalModal = (): Action => ({ type: OPEN_EDIT_MODAL });
export const closeDeleteProposalModal = (): Action => ({ type: CLOSE_DELETE_MODAL });
export const openDeleteProposalModal = (): Action => ({ type: OPEN_DELETE_MODAL });
export const submitProposalForm = (): Action => ({ type: SUBMIT_PROPOSAL_FORM });
export const editProposalForm = (): Action => ({ type: EDIT_PROPOSAL_FORM });
export const openCreateModal = (): Action => ({ type: OPEN_CREATE_MODAL });
export const cancelSubmitProposal = (): Action => ({ type: CANCEL_SUBMIT_PROPOSAL });
export const closeCreateModal = (): Action => ({ type: CLOSE_CREATE_MODAL });
export const openVoteModal = (id: number): Action => ({ type: OPEN_VOTE_MODAL, id });
export const closeVoteModal = () => ({ type: CLOSE_VOTE_MODAL });
export const changePage = (page: number): Action => ({ type: CHANGE_PAGE, page });
export const changeOrder = (order: string): Action => ({ type: CHANGE_ORDER, order });
export const changeTerm = (terms: string): Action => ({
  type: CHANGE_TERMS,
  terms,
});
export const changeFilter = (filter: string, value: string): ChangeFilterAction => ({
  type: CHANGE_FILTER,
  filter,
  value,
});
export const loadProposals = (step: ?number): Action => ({ type: FETCH_REQUESTED, step });

export const deleteProposal = (form: number, proposal: Object, dispatch: Dispatch): void => {
  dispatch({ type: DELETE_REQUEST });
  Fetcher
    .delete(`/proposal_forms/${form}/proposals/${proposal.id}`)
    .then(() => {
      dispatch(closeDeleteProposalModal());
      window.location.href = proposal._links.index;
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: { bsStyle: 'success', content: 'proposal.request.delete.success' },
      });
    })
    .catch(() => {
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: { bsStyle: 'warning', content: 'proposal.request.delete.failure' },
      });
    });
};

export const startVoting = (): Action => ({ type: VOTE_REQUESTED });
export const stopVoting = (): Action => ({ type: VOTE_FAILED });

const unSelectStepSucceed = (stepId, proposalId): Action => ({ type: UNSELECT_SUCCEED, stepId, proposalId });
const selectStepSucceed = (stepId, proposalId): Action => ({ type: SELECT_SUCCEED, stepId, proposalId });
const updateSelectionStatusSucceed = (stepId: number, proposalId: number, status: ?Status): Action => ({ type: UPDATE_SELECTION_STATUS_SUCCEED, stepId, proposalId, status });
const updateProposalCollectStatusSucceed = (proposalId: number, stepId: number, status: ?Status): Action => ({ type: UPDATE_PROPOSAL_STATUS_SUCCEED, proposalId, stepId, status });
export const sendProposalNotificationSucceed = (proposalId: number, stepId: number): Action => ({ type: SEND_PROPOSAL_NOTIFICATION_SUCCEED, proposalId, stepId });
const sendProposalNotificationError = (error: string): Action => ({ type: SEND_PROPOSAL_NOTIFICATION_ERROR, error });

export const sendProposalNotification = (dispatch: Dispatch, proposalId: number, stepId: number): void => {
  Fetcher.post(`/proposals/${proposalId}/notify-status-changed`)
    .then(() => { dispatch(sendProposalNotificationSucceed(proposalId, stepId)); })
    .catch((error) => { dispatch(sendProposalNotificationError(error)); });
};

export const sendSelectionNotification = (dispatch: Dispatch, proposalId: number, stepId: number): void => {
  Fetcher.post(`/selection_step/${stepId}/proposals/${proposalId}/notify-status-changed`, { proposalId, stepId })
    .then(() => { dispatch(sendProposalNotificationSucceed(proposalId, stepId)); })
    .catch((error) => { dispatch(sendProposalNotificationError(error)); });
};

export const updateProposalStatus = (dispatch: Dispatch, proposalId: number, stepId: number, value: number) => {
  Fetcher
    .patch(`/proposals/${proposalId}`, { status: value })
    .then(json)
    .then((status) => {
      dispatch(updateProposalCollectStatusSucceed(proposalId, stepId, status));
    })
    .catch(() => {
      dispatch(updateProposalCollectStatusSucceed(proposalId, stepId));
    });
};

export const updateSelectionStatus = (dispatch: Dispatch, proposalId: number, stepId: number, value: number) => {
  Fetcher
    .patch(`/selection_steps/${stepId}/selections/${proposalId}`, { status: value })
    .then(json)
    .then((status) => {
      dispatch(updateSelectionStatusSucceed(stepId, proposalId, status));
    })
    .catch(() => {
      dispatch(updateSelectionStatusSucceed(stepId, proposalId, null));
    });
};
export const updateStepStatus = (dispatch: Dispatch, proposalId: number, step: Object, value: number) => {
  if (step.step_type === 'selection') {
    updateSelectionStatus(dispatch, proposalId, step.id, value);
  } else {
    updateProposalStatus(dispatch, proposalId, step.id, value);
  }
};

export const unSelectStep = (dispatch: Dispatch, proposalId: number, stepId: number) => {
  Fetcher
    .delete(`/selection_steps/${stepId}/selections/${proposalId}`)
    .then(() => {
      dispatch(unSelectStepSucceed(stepId, proposalId));
    });
};
export const selectStep = (dispatch: Dispatch, proposalId: number, stepId: number) => {
  Fetcher
    .post(`/selection_steps/${stepId}/selections`, { proposal: proposalId })
    .then(() => {
      dispatch(selectStepSucceed(stepId, proposalId));
    });
};

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
    .then((newVote) => {
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
          throw new SubmissionError({ _error: response.errors.children.email.errors[0] });
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
      return false;
  }
  return Fetcher
      .delete(url)
      .then(json)
      .then((v) => {
        dispatch(deleteVoteSucceeded(step.id, proposal.id, v));
        FluxDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'proposal.request.delete_vote.success' },
        });
      })
      .catch((e) => {
        console.log(e); // eslint-disable-line no-console
        FluxDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'warning', content: 'proposal.request.delete_vote.failure' },
        });
      });
};

export const submitProposal = (dispatch: Dispatch, form: number, data: Object): Promise<*> => {
  const formData = new FormData();
  const flattenedData = flatten(data);
  Object.keys(flattenedData).map((key) => {
    if (flattenedData[key] !== -1) {
      formData.append(key, flattenedData[key]);
    }
  });
  return Fetcher
      .postFormData(`/proposal_forms/${form}/proposals`, formData)
      .then(() => {
        dispatch(closeCreateModal());
        dispatch(loadProposals());
        FluxDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'proposal.request.create.success' },
        });
      })
      .catch(() => {
        dispatch(cancelSubmitProposal());
        FluxDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'warning', content: 'proposal.request.create.failure' },
        });
      })
    ;
};

export const updateProposal = (dispatch: Dispatch, form: number, id: number, data: Object) => {
  const formData = new FormData();
  const flattenedData = flatten(data);
  Object.keys(flattenedData).map(key => formData.append(key, flattenedData[key]));
  return Fetcher
    .postFormData(`/proposal_forms/${form}/proposals/${id}`, formData)
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
        alert: { bsStyle: 'warning', content: 'proposal.request.update.failure' },
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
        `/steps/${stepId}/proposals/${proposalId}/votes?offset=${iterationCount * votesPerIteration}&limit=${votesPerIteration}`,
      );
      hasMore = result.hasMore;
      iterationCount++;
      yield put({
        type: VOTES_FETCH_SUCCEEDED,
        votes: result.votes,
        stepId,
        proposalId,
      });
    }
  } catch (e) {
    yield put({ type: VOTES_FETCH_FAILED, error: e });
  }
}

function* submitFusionFormData(action: SubmitFusionFormAction): Generator<*, *, *> {
  const { proposalForm } = action;
  // $FlowFixMe
  const globalState = yield select();
  const formData = new FormData();
  const data = { ...globalState.form.proposal.values };
  delete data.project;
  if (data.responses.length === 0) {
    delete data.responses;
  }
  const flattenedData = flatten(data);
  Object.keys(flattenedData).map((key) => {
    formData.append(key, flattenedData[key]);
  });
  try {
    yield call(
      Fetcher.postFormData,
      `/proposal_forms/${proposalForm}/proposals`,
      formData,
    );
    yield put(closeCreateFusionModal());
    location.reload();
  } catch (e) {
    yield put(cancelSubmitFusionForm());
  }
}

export function* fetchProposals(action: Object): Generator<*, *, *> {
  let { step } = action;
  // $FlowFixMe
  const globalState = yield select();
  step = step || globalState.project.projects[globalState.project.currentProjectById].steps.filter(s => s.id === globalState.project.currentProjectStepById)[0];
  const state = globalState.proposal;
  let url = '';
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
  url += `?page=${state.currentPaginationPage}&pagination=${PROPOSAL_PAGINATION}&order=${state.order}`;
  const result = yield call(
    Fetcher.postToJson,
    url,
    {
      terms: state.terms,
      filters: state.filters,
    },
  );
  yield put({ type: FETCH_SUCCEEDED, proposals: result.proposals, count: result.count });
}


export const fetchProposalPosts = (proposalId: number): Action => ({ type: POSTS_FETCH_REQUESTED, proposalId });

export function* fetchPosts(action: Object): Generator<*, *, *> {
  try {
    const result = yield call(Fetcher.get, `/proposals/${action.proposalId}/posts`);
    yield put({ type: POSTS_FETCH_SUCCEEDED, posts: result.posts, proposalId: action.proposalId });
  } catch (e) {
    yield put({ type: POSTS_FETCH_FAILED, error: e });
  }
}
export function* fetchSelections(action: Object): Generator<*, *, *> {
  try {
    const selections = yield call(Fetcher.get, `/proposals/${action.proposalId}/selections`);
    yield put({ type: LOAD_SELECTIONS_SUCCEEDED, selections, proposalId: action.proposalId });
  } catch (e) {
    console.log(e); // eslint-disable-line
  }
}

export function* storeFiltersInLocalStorage(action: ChangeFilterAction): Generator<*, *, *> {
  const { filter, value } = action;
  // $FlowFixMe
  const state = yield select();
  const filters = { ...state.proposal.filters, [filter]: value };
  const filtersByStep = LocalStorageService.get('proposal.filtersByStep') || {};
  filtersByStep[state.project.currentProjectStepById] = filters;
  LocalStorageService.set('proposal.filtersByStep', filtersByStep);
}

export function* storeOrderInLocalStorage(action: ChangeOrderAction): Generator<*, *, *> {
  const { order } = action;
  // $FlowFixMe
  const state = yield select();
  const orderByStep = LocalStorageService.get('proposal.orderByStep') || {};
  orderByStep[state.project.currentProjectStepById] = order;
  LocalStorageService.set('proposal.orderByStep', orderByStep);
}

export function* saga(): Generator<*, *, *> {
  yield [
    takeEvery(POSTS_FETCH_REQUESTED, fetchPosts),
    takeEvery(VOTES_FETCH_REQUESTED, fetchVotesByStep),
    takeEvery(FETCH_REQUESTED, fetchProposals),
    takeEvery(SUBMIT_FUSION_FORM, submitFusionFormData),
    takeEvery(LOAD_SELECTIONS_REQUEST, fetchSelections),
    takeEvery(CHANGE_FILTER, storeFiltersInLocalStorage),
    takeEvery(CHANGE_ORDER, storeOrderInLocalStorage),
  ];
}

const voteReducer = (state: State, action): State => {
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
  proposalsById[action.proposalId] = { ...proposal, votesCountByStepId, votesByStepId, comments_count: commentsCount };
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
const deleteVoteReducer = (state: State, action): State => {
  const proposal = state.proposalsById[action.proposalId];
  if (!proposal) {
    const userVotesByStepId = state.userVotesByStepId;
    userVotesByStepId[action.stepId] = userVotesByStepId[action.stepId].filter(voteId => voteId !== action.proposalId);
    return { ...state, userVotesByStepId };
  }// Fix for user votes page
  const votesCountByStepId = proposal.votesCountByStepId;
  votesCountByStepId[action.stepId]--;
  const votesByStepId = proposal.votesByStepId || [];
  if (action.vote.user) {
    votesByStepId[action.stepId] = votesByStepId[action.stepId].filter(v => !v.user || v.user.uniqueId !== action.vote.user.uniqueId);
  } else {
    votesByStepId[action.stepId].slice(votesByStepId[action.stepId].findIndex(v => v.user === null), 1);
  }
  const proposalsById = state.proposalsById;
  const userVotesByStepId = state.userVotesByStepId;
  userVotesByStepId[action.stepId] = userVotesByStepId[action.stepId].filter(voteId => voteId !== action.proposalId);
  proposalsById[action.proposalId] = { ...proposal, votesCountByStepId, votesByStepId };
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

const updateSelectionStatusSucceedReducer = (state: State, action): State => {
  const proposalsById = state.proposalsById;
  const proposal = proposalsById[action.proposalId];
  const selections = proposal.selections.map((s) => {
    if (s.step.id === action.stepId) {
      s.status = action.status;
    }
    return s;
  });
  proposalsById[action.proposalId] = { ...proposal, selections };
  const lastEditedStepId = action.status === -1 ? null : action.stepId;
  return { ...state, proposalsById, lastEditedStepId, lastNotifiedStepId: null };
};

const updateProposalStatusReducer = (state: State, action): State => {
  const proposalsById = state.proposalsById;
  const proposal = proposalsById[action.proposalId];
  proposalsById[action.proposalId] = { ...proposal, status: action.status };
  const lastEditedStepId = action.status === -1 ? null : action.stepId;
  return { ...state, proposalsById, lastEditedStepId, lastNotifiedStepId: null };
};

const unselectReducer = (state: State, action): State => {
  const proposalsById = state.proposalsById;
  const proposal = proposalsById[action.proposalId];
  const selections = proposal.selections.filter(s => s.step.id !== action.stepId);
  proposalsById[action.proposalId] = { ...proposal, selections };
  return { ...state, proposalsById, lastEditedStepId: null, lastNotifiedStepId: null };
};

const fetchSucceededReducer = (state: State, action): State => {
  const proposalsById = action.proposals.reduce((map, obj) => {
    map[obj.id] = obj;
    return map;
  }, {});
  const proposalShowedId = action.proposals.map(proposal => proposal.id);
  return { ...state, proposalsById, proposalShowedId, isLoading: false, queryCount: action.count };
};

const selectSucceededReducer = (state: State, action): State => {
  const proposalsById = state.proposalsById;
  const proposal = proposalsById[action.proposalId];
  const selections = [...proposal.selections, { step: { id: action.stepId }, status: null }];
  proposalsById[action.proposalId] = { ...proposal, selections };
  return { ...state, proposalsById };
};

const fetchVotesSucceedReducer = (state: State, action): State => {
  const proposal = state.proposalsById[action.proposalId];
  const votesByStepId = proposal.votesByStepId || [];
  votesByStepId[action.stepId] = action.votes;
  const proposalsById = state.proposalsById;
  proposalsById[action.proposalId] = { ...proposal, votesByStepId };
  return { ...state, proposalsById };
};

export const reducer = (state: State = initialState, action: Action): State => {
  switch (action.type) {
    case '@@INIT':
      return { ...initialState, ...state };
    case CHANGE_FILTER: {
      const filters = { ...state.filters, [action.filter]: action.value };
      return { ...state, filters, currentPaginationPage: 1 };
    }
    case OPEN_CREATE_FUSION_MODAL:
      return { ...state, isCreatingFusion: true };
    case CLOSE_CREATE_FUSION_MODAL:
      return { ...state, isCreatingFusion: false };
    case SUBMIT_FUSION_FORM:
      return { ...state, isSubmittingFusion: true };
    case CANCEL_SUBMIT_FUSION_FORM:
      return { ...state, isSubmittingFusion: false };
    case OPEN_VOTES_MODAL:
      return { ...state, currentVotesModal: { proposalId: state.currentProposalId, stepId: action.stepId } };
    case CLOSE_VOTES_MODAL:
      return { ...state, currentVotesModal: null };
    case CHANGE_ORDER:
      return { ...state, order: action.order, currentPaginationPage: 1 };
    case CHANGE_PAGE:
      return { ...state, currentPaginationPage: action.page };
    case CHANGE_TERMS:
      return { ...state, terms: action.terms, currentPaginationPage: 1 };
    case SUBMIT_PROPOSAL_FORM:
      return { ...state, isCreating: true };
    case CANCEL_SUBMIT_PROPOSAL:
      return { ...state, isCreating: false, isEditing: false };
    case EDIT_PROPOSAL_FORM:
      return { ...state, isEditing: true };
    case OPEN_EDIT_MODAL:
      return { ...state, showEditModal: true };
    case CLOSE_EDIT_MODAL:
      return { ...state, showEditModal: false, isEditing: false };
    case OPEN_DELETE_MODAL:
      return { ...state, showDeleteModal: true };
    case CLOSE_DELETE_MODAL:
      return { ...state, showDeleteModal: false, isDeleting: false };
    case OPEN_CREATE_MODAL:
      return { ...state, showCreateModal: true };
    case CLOSE_CREATE_MODAL:
      return { ...state, showCreateModal: false, isCreating: false };
    case OPEN_VOTE_MODAL:
      return { ...state, currentVoteModal: action.id };
    case CLOSE_VOTE_MODAL:
      return { ...state, currentVoteModal: null, isVoting: false };
    case VOTE_REQUESTED:
      return { ...state, isVoting: true };
    case VOTE_FAILED:
      return { ...state, isVoting: false };
    case SELECT_SUCCEED:
      return selectSucceededReducer(state, action);
    case UNSELECT_SUCCEED:
      return unselectReducer(state, action);
    case UPDATE_PROPOSAL_STATUS_SUCCEED:
      return updateProposalStatusReducer(state, action);
    case UPDATE_SELECTION_STATUS_SUCCEED:
      return updateSelectionStatusSucceedReducer(state, action);
    case DELETE_VOTE_REQUESTED:
      return { ...state, currentDeletingVote: action.proposalId };
    case VOTE_SUCCEEDED:
      return voteReducer(state, action);
    case DELETE_VOTE_SUCCEEDED:
      return deleteVoteReducer(state, action);
    case DELETE_REQUEST:
      return { ...state, isDeleting: true };
    case FETCH_REQUESTED:
      return { ...state, isLoading: true };
    case FETCH_SUCCEEDED:
      return fetchSucceededReducer(state, action);
    case LOAD_SELECTIONS_SUCCEEDED: {
      const proposalsById = state.proposalsById;
      proposalsById[action.proposalId] = {
        ...state.proposalsById[action.proposalId], selections: action.selections };
      return { ...state, proposalsById };
    }
    case POSTS_FETCH_SUCCEEDED: {
      const posts = action.posts;
      const proposalsById = state.proposalsById;
      proposalsById[action.proposalId] = { ...state.proposalsById[action.proposalId], posts };
      return { ...state, proposalsById };
    }
    case VOTES_FETCH_SUCCEEDED:
      return fetchVotesSucceedReducer(state, action);
    case POSTS_FETCH_FAILED: {
      console.log(POSTS_FETCH_FAILED, action.error); // eslint-disable-line no-console
      return state;
    }
    case SEND_PROPOSAL_NOTIFICATION_SUCCEED: {
      return { ...state, lastNotifiedStepId: action.stepId };
    }
    case SEND_PROPOSAL_NOTIFICATION_ERROR: {
      console.log(SEND_PROPOSAL_NOTIFICATION_ERROR, action.error); // eslint-disable-line no-console
      return state;
    }
    default:
      return state;
  }
};
