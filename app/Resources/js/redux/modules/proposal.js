import Fetcher, { json } from '../../services/Fetcher';
import { takeEvery } from 'redux-saga';
import { select, call, put } from 'redux-saga/effects';
import FluxDispatcher from '../../dispatchers/AppDispatcher';
import { UPDATE_ALERT } from '../../constants/AlertConstants';
import flatten from 'flat';
import { SubmissionError } from 'redux-form';
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

const initialState = {
  currentProposalId: null,
  proposalShowedId: [],
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
};

export const loadSelections = (proposalId) => ({ type: LOAD_SELECTIONS_REQUEST, proposalId });
export const loadSelectionsSucess = (proposalId) => ({ type: LOAD_SELECTIONS_SUCCEEDED, proposalId });
export const closeCreateFusionModal = () => ({ type: CLOSE_CREATE_FUSION_MODAL });
export const openCreateFusionModal = () => ({ type: OPEN_CREATE_FUSION_MODAL });
export const submitFusionForm = (proposalForm) => ({ type: SUBMIT_FUSION_FORM, proposalForm });
export const cancelSubmitFusionForm = (proposalForm) => ({ type: CANCEL_SUBMIT_FUSION_FORM, proposalForm });
export const openVotesModal = (stepId) => ({ type: OPEN_VOTES_MODAL, stepId });
export const closeVotesModal = (stepId) => ({ type: CLOSE_VOTES_MODAL, stepId });
export const voteSuccess = (proposalId, stepId, vote, comment) => ({
  type: VOTE_SUCCEEDED,
  proposalId,
  stepId,
  vote,
  comment,
});
export const loadVotes = (stepId, proposalId) => ({
  type: VOTES_FETCH_REQUESTED,
  stepId,
  proposalId,
});
const deleteVoteSucceeded = (stepId, proposalId, vote) => ({ type: DELETE_VOTE_SUCCEEDED, proposalId, stepId, vote });
const deleteVoteRequested = (proposalId) => ({
  type: DELETE_VOTE_REQUESTED,
  proposalId,
});
export const closeEditProposalModal = () => ({ type: CLOSE_EDIT_MODAL });
export const openEditProposalModal = () => ({ type: OPEN_EDIT_MODAL });
export const closeDeleteProposalModal = () => ({ type: CLOSE_DELETE_MODAL });
export const openDeleteProposalModal = () => ({ type: OPEN_DELETE_MODAL });
export const submitProposalForm = () => ({ type: SUBMIT_PROPOSAL_FORM });
export const editProposalForm = () => ({ type: EDIT_PROPOSAL_FORM });
export const openCreateModal = () => ({ type: OPEN_CREATE_MODAL });
export const cancelSubmitProposal = () => ({ type: CANCEL_SUBMIT_PROPOSAL });
export const closeCreateModal = () => ({ type: CLOSE_CREATE_MODAL });
export const openVoteModal = (id) => ({ type: OPEN_VOTE_MODAL, id });
export const closeVoteModal = () => ({ type: CLOSE_VOTE_MODAL });
export const changePage = (page) => ({ type: CHANGE_PAGE, page });
export const changeOrder = (order) => ({ type: CHANGE_ORDER, order });
export const changeTerm = (terms) => ({
  type: CHANGE_TERMS,
  terms,
});
export const changeFilter = (filter, value) => ({
  type: CHANGE_FILTER,
  filter,
  value,
});
export const loadProposals = (step) => ({ type: FETCH_REQUESTED, step });

export const deleteProposal = (form, proposal, dispatch) => {
  dispatch({ type: DELETE_REQUEST });
  return Fetcher
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

export const startVoting = () => ({ type: VOTE_REQUESTED });
export const stopVoting = () => ({ type: VOTE_FAILED });

const unSelectStepSucceed = (stepId, proposalId) => ({ type: UNSELECT_SUCCEED, stepId, proposalId });
const selectStepSucceed = (stepId, proposalId) => ({ type: SELECT_SUCCEED, stepId, proposalId });
const updateSelectionStatusSucceed = (stepId, proposalId, status) => ({ type: UPDATE_SELECTION_STATUS_SUCCEED, stepId, proposalId, status });
const updateProposalCollectStatusSucceed = (proposalId, status) => ({ type: UPDATE_PROPOSAL_STATUS_SUCCEED, proposalId, status });

export const updateProposalStatus = (dispatch, proposalId, value) => {
  Fetcher
    .patch(`/proposals/${proposalId}`, { status: value })
    .then(json)
    .then(status => {
      dispatch(updateProposalCollectStatusSucceed(proposalId, status));
    })
    .catch(() => {
      dispatch(updateProposalCollectStatusSucceed(proposalId, null));
    });
};

export const updateSelectionStatus = (dispatch, proposalId, stepId, value) => {
  Fetcher
    .patch(`/selection_steps/${stepId}/selections/${proposalId}`, { status: value })
    .then(json)
    .then(status => {
      dispatch(updateSelectionStatusSucceed(stepId, proposalId, status));
    })
    .catch(() => {
      dispatch(updateSelectionStatusSucceed(stepId, proposalId, null));
    });
};
export const updateStepStatus = (dispatch, proposalId, step, value) => {
  if (step.step_type === 'selection') {
    updateSelectionStatus(dispatch, proposalId, step.id, value);
  } else {
    updateProposalStatus(dispatch, proposalId, value);
  }
};

export const unSelectStep = (dispatch, proposalId, stepId) => {
  Fetcher
    .delete(`/selection_steps/${stepId}/selections/${proposalId}`)
    .then(() => {
      dispatch(unSelectStepSucceed(stepId, proposalId));
    });
};
export const selectStep = (dispatch, proposalId, stepId) => {
  Fetcher
    .post(`/selection_steps/${stepId}/selections`, { proposal: proposalId })
    .then(() => {
      dispatch(selectStepSucceed(stepId, proposalId));
    });
};

export const vote = (dispatch, step, proposal, data) => {
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

export const deleteVote = (dispatch, step, proposal) => {
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
      .then(v => {
        dispatch(deleteVoteSucceeded(step.id, proposal.id, v));
        FluxDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'proposal.request.delete_vote.success' },
        });
      })
      .catch(e => {
        console.log(e); // eslint-disable-line no-console
        FluxDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'warning', content: 'proposal.request.delete_vote.failure' },
        });
      });
};

export const submitProposal = (dispatch, form, data) => {
  const formData = new FormData();
  const flattenedData = flatten(data);
  Object.keys(flattenedData).map(key => {
    formData.append(key, flattenedData[key]);
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

export const updateProposal = (dispatch, form, id, data) => {
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
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: { bsStyle: 'warning', content: 'proposal.request.update.failure' },
      });
    });
};

export function* fetchVotesByStep({ stepId, proposalId }) {
  try {
    let hasMore = true;
    let iterationCount = 0;
    const votesPerIteration = 50;
    while (hasMore) {
      const result = yield call(
        Fetcher.get,
        `/steps/${stepId}/proposals/${proposalId}/votes?offset=${iterationCount * votesPerIteration}&limit=${votesPerIteration}`
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

function* submitFusionFormData({ proposalForm }) {
  const globalState = yield select();
  const formData = new FormData();
  const data = { ...globalState.form.proposal.values };
  delete data.project;
  const flattenedData = flatten(data);
  Object.keys(flattenedData).map(key => {
    formData.append(key, flattenedData[key]);
  });
  try {
    yield call(
      Fetcher.postFormData,
      `/proposal_forms/${proposalForm}/proposals`,
      formData
    );
    yield put(closeCreateFusionModal());
    location.reload();
  } catch (e) {
    yield put(cancelSubmitFusionForm());
  }
}

export function* fetchProposals({ step }) {
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
  yield put({ type: FETCH_SUCCEEDED, proposals: result.proposals });
}


export const fetchProposalPosts = (proposalId) => ({ type: POSTS_FETCH_REQUESTED, proposalId });

export function* fetchPosts(action) {
  try {
    const result = yield call(Fetcher.get, `/proposals/${action.proposalId}/posts`);
    yield put({ type: POSTS_FETCH_SUCCEEDED, posts: result.posts, proposalId: action.proposalId });
  } catch (e) {
    yield put({ type: POSTS_FETCH_FAILED, error: e });
  }
}
export function* fetchSelections(action) {
  try {
    const selections = yield call(Fetcher.get, `/proposals/${action.proposalId}/selections`);
    yield put({ type: LOAD_SELECTIONS_SUCCEEDED, selections, proposalId: action.proposalId });
  } catch (e) {
    console.log(e); // eslint-disable-line
  }
}

export function* saga() {
  yield [
    takeEvery(POSTS_FETCH_REQUESTED, fetchPosts),
    takeEvery(VOTES_FETCH_REQUESTED, fetchVotesByStep),
    takeEvery(FETCH_REQUESTED, fetchProposals),
    takeEvery(SUBMIT_FUSION_FORM, submitFusionFormData),
    takeEvery(LOAD_SELECTIONS_REQUEST, fetchSelections),
  ];
}

export const reducer = (state = initialState, action) => {
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
      return { ...state, isCreating: false };
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
    case SELECT_SUCCEED: {
      const proposalsById = state.proposalsById;
      const proposal = proposalsById[action.proposalId];
      const selections = [...proposal.selections, { step: { id: action.stepId }, status: null }];
      proposalsById[action.proposalId] = { ...proposal, selections };
      return { ...state, proposalsById };
    }
    case UNSELECT_SUCCEED: {
      const proposalsById = state.proposalsById;
      const proposal = proposalsById[action.proposalId];
      const selections = proposal.selections.filter(s => s.step.id !== action.stepId);
      proposalsById[action.proposalId] = { ...proposal, selections };
      return { ...state, proposalsById };
    }
    case UPDATE_PROPOSAL_STATUS_SUCCEED: {
      const proposalsById = state.proposalsById;
      const proposal = proposalsById[action.proposalId];
      proposalsById[action.proposalId] = { ...proposal, status: action.status };
      return { ...state, proposalsById };
    }
    case UPDATE_SELECTION_STATUS_SUCCEED: {
      const proposalsById = state.proposalsById;
      const proposal = proposalsById[action.proposalId];
      const selections = proposal.selections.map(s => {
        if (s.step.id === action.stepId) {
          s.status = action.status;
        }
        return s;
      });
      proposalsById[action.proposalId] = { ...proposal, selections };
      return { ...state, proposalsById };
    }
    case DELETE_VOTE_REQUESTED:
      return { ...state, currentDeletingVote: action.proposalId };
    case VOTE_SUCCEEDED: {
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
    }
    case DELETE_VOTE_SUCCEEDED: {
      const proposal = state.proposalsById[action.proposalId];
      if (!proposal) return { ...state }; // Fix for user votes page
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
    }
    case DELETE_REQUEST:
      return { ...state, isDeleting: true };
    case FETCH_REQUESTED:
      return { ...state, isLoading: true };
    case FETCH_SUCCEEDED: {
      const proposalsById = action.proposals.reduce((map, obj) => {
        map[obj.id] = obj;
        return map;
      }, {});
      const proposalShowedId = action.proposals.map((proposal) => proposal.id);
      return { ...state, proposalsById, proposalShowedId, isLoading: false };
    }
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
    case VOTES_FETCH_SUCCEEDED: {
      const proposal = state.proposalsById[action.proposalId];
      const votesByStepId = proposal.votesByStepId || [];
      votesByStepId[action.stepId] = action.votes;
      const proposalsById = state.proposalsById;
      proposalsById[action.proposalId] = { ...proposal, votesByStepId };
      return { ...state, proposalsById };
    }
    case POSTS_FETCH_FAILED: {
      console.log(POSTS_FETCH_FAILED, action.error); // eslint-disable-line no-console
      return state;
    }
    default:
      return state;
  }
};
