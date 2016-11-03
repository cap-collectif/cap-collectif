import Fetcher, { json } from '../../services/Fetcher';
import { takeEvery } from 'redux-saga';
import { select, call, put } from 'redux-saga/effects';
import FluxDispatcher from '../../dispatchers/AppDispatcher';
import { UPDATE_ALERT } from '../../constants/AlertConstants';
import flatten from 'flat';

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
export const PROPOSAL_PAGINATION = 50;
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

const initialState = {
  currentProposalId: null,
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

export const closeCreateFusionModal = () => ({ type: CLOSE_CREATE_FUSION_MODAL });
export const openCreateFusionModal = () => ({ type: OPEN_CREATE_FUSION_MODAL });
export const submitFusionForm = (proposalForm) => ({ type: SUBMIT_FUSION_FORM, proposalForm });
export const cancelSubmitFusionForm = (proposalForm) => ({ type: CANCEL_SUBMIT_FUSION_FORM, proposalForm });
export const openVotesModal = (stepId) => ({ type: OPEN_VOTES_MODAL, stepId });
export const closeVotesModal = (stepId) => ({ type: CLOSE_VOTES_MODAL, stepId });
export const voteSuccess = (proposalId, stepId, vote) => ({
  type: VOTE_SUCCEEDED, proposalId, stepId, vote,
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

export const vote = (dispatch, step, proposal, data = {}) => {
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
  Fetcher.post(url, data)
    .then(json)
    .then(newVote => {
      dispatch(voteSuccess(proposal.id, step.id, newVote));
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: { bsStyle: 'success', content: 'proposal.request.vote.success' },
      });
    })
    .catch((error) => {
      dispatch(closeVoteModal());
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: { bsStyle: 'danger', content: 'proposal.request.vote.failure' },
      });
      console.log(error); // eslint-disable-line no-console
    });
};

export const startVoting = () => ({ type: VOTE_REQUESTED });

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
      .catch((e) => {
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
        alert: { bsStyle: 'success', content: 'proposal.request.update.success' },
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

export function* saga() {
  yield [
    takeEvery(POSTS_FETCH_REQUESTED, fetchPosts),
    takeEvery(VOTES_FETCH_REQUESTED, fetchVotesByStep),
    takeEvery(FETCH_REQUESTED, fetchProposals),
    takeEvery(SUBMIT_FUSION_FORM, submitFusionFormData),
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
    case DELETE_VOTE_REQUESTED:
      return { ...state, currentDeletingVote: action.proposalId };
    case VOTE_SUCCEEDED: {
      const proposal = state.proposalsById[action.proposalId];
      const votesByStepId = proposal.votesByStepId || {};
      votesByStepId[action.stepId].unshift(action.vote);
      const votesCountByStepId = proposal.votesCountByStepId;
      votesCountByStepId[action.stepId]++;
      const proposalsById = state.proposalsById;
      const userVotesByStepId = state.userVotesByStepId;
      userVotesByStepId[action.stepId].push(proposal.id);
      proposalsById[action.proposalId] = { ...proposal, votesCountByStepId, votesByStepId };
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
        votesByStepId[action.stepId] = votesByStepId[action.stepId].filter(v => v.user.uniqueId !== action.vote.user.uniqueId);
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
      return { ...state, proposalsById, isLoading: false };
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
