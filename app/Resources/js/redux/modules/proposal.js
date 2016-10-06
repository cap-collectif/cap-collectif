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
export const DELETE_VOTE_REQUESTED = 'proposal/VOTE_REQUESTED';
export const DELETE_VOTE_SUCCEEDED = 'proposal/DELETE_VOTE_SUCCEEDED';
export const DELETE_VOTE_FAILED = 'proposal/DELETE_VOTE_FAILED';
export const PROPOSAL_PAGINATION = 50;
export const CHANGE_PAGE = 'proposal/CHANGE_PAGE';
export const CHANGE_ORDER = 'proposal/CHANGE_ORDER';
export const CHANGE_TERMS = 'proposal/CHANGE_TERMS';
export const CHANGE_FILTER = 'proposal/CHANGE_FILTER';

export const SUBMIT_PROPOSAL_FORM = 'proposal/SUBMIT_PROPOSAL_FORM';

export const CLOSE_DELETE_MODAL = 'proposal/CLOSE_DELETE_MODAL';
export const OPEN_DELETE_MODAL = 'proposal/OPEN_DELETE_MODAL';
export const CLOSE_EDIT_MODAL = 'proposal/CLOSE_EDIT_MODAL';
export const OPEN_EDIT_MODAL = 'proposal/OPEN_EDIT_MODAL';

// this._creditsLeft = 0;
// this._proposalVotesByStepIds = {};
// this._votableSteps = [];
// this._votesCountByStepId = {};
const initialState = {
  currentProposalById: null,
  proposals: [],
  creditsLeft: 0,
  currentVoteModal: null,
  showCreateModal: false,
  isCreating: false,
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

export const voteSuccess = (proposalId, vote) => {
  return {
    type: VOTE_SUCCEEDED,
    proposalId,
    vote,
  };
};

export const closeEditProposalModal = () => {
  return {
    type: CLOSE_EDIT_MODAL,
  };
};

export const openEditProposalModal = () => {
  return {
    type: OPEN_EDIT_MODAL,
  };
};

export const closeDeleteProposalModal = () => {
  return {
    type: CLOSE_DELETE_MODAL,
  };
};

export const openDeleteProposalModal = () => {
  return {
    type: OPEN_DELETE_MODAL,
  };
};

export const submitProposalForm = () => {
  return {
    type: SUBMIT_PROPOSAL_FORM,
  };
};

export const openCreateModal = () => {
  return {
    type: OPEN_CREATE_MODAL,
  };
};

export const closeCreateModal = () => {
  return {
    type: CLOSE_CREATE_MODAL,
  };
};

export const openVoteModal = (id) => {
  return {
    type: OPEN_VOTE_MODAL,
    id,
  };
};

export const closeVoteModal = () => {
  return {
    type: CLOSE_VOTE_MODAL,
  };
};

export const changePage = (page) => {
  return {
    type: CHANGE_PAGE,
    page,
  };
};

export const changeOrder = (order) => {
  return {
    type: CHANGE_ORDER,
    order,
  };
};

export const changeTerm = (terms) => {
  return {
    type: CHANGE_TERMS,
    terms,
  };
};

export const changeFilter = (filter, value) => {
  return {
    type: CHANGE_FILTER,
    filter,
    value,
  };
};

export const loadProposals = () => {
  return {
    type: FETCH_REQUESTED,
  };
};

export const deleteProposal = (form, proposal, dispatch) => {
  return Fetcher
    .delete(`/proposal_forms/${form}/proposals/${proposal}`)
    .then(() => {
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: { bsStyle: 'success', content: 'proposal.request.delete.success' },
      });
      dispatch(closeDeleteProposalModal());
      window.location.href = proposal._links.index;
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
  switch (step.step_type) {
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
      dispatch(voteSuccess(proposal.id, newVote));
      dispatch(closeVoteModal());
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: { bsStyle: 'success', content: 'proposal.request.vote.success' },
      });
    })
    .catch((error) => {
      console.log(error); // eslint-disable-line no-console
    });
};

export const startVoting = () => {
  return {
    type: VOTE_REQUESTED,
  };
};

export const deleteVote = (dispatch, step, proposal) => {
  let url = '';
  switch (step.step_type) {
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
      .then(() => {
        FluxDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'proposal.request.delete_vote.success' },
        });
      })
      .catch(() => {
        FluxDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'warning', content: 'proposal.request.delete_vote.failure' },
        });
      });
};

export const submitProposal = (dispatch, form, data) => {
  const formData = new FormData();
  const flattenedData = flatten(data);
  Object.keys(flattenedData).map(key => formData.append(key, flattenedData[key]));
  return Fetcher
      .postFormData(`/proposal_forms/${form}/proposals`, data)
      .then(() => {
        dispatch(closeCreateModal());
        dispatch(loadProposals());
        FluxDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'proposal.request.create.success' },
        });
      })
      .catch(() => {
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
    .postFormData(`/proposal_forms/${form}/proposals/${id}`, data)
    .then(() => {
      // reload proposal
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

// export function* fetchAllVotes(action) {
//   // try {
//   //   let hasMore = true;
//   //   let iterationCount = 0;
//   //   const votesPerIteration = 50;
//   //   while (hasMore) {
//   //     const result = yield call(
//   //       Fetcher.get,
//   //       `/ideas/${action.ideaId}/votes?offset=${iterationCount * votesPerIteration}&limit=${votesPerIteration}`
//   //     );
//   //     hasMore = result.hasMore;
//   //     iterationCount++;
//   //     yield put({ type: VOTES_FETCH_SUCCEEDED, votes: result.votes, ideaId: action.ideaId });
//   //   }
//   // } catch (e) {
//   //   yield put({ type: VOTES_FETCH_FAILED, error: e });
//   // }
// }

export function* fetchProposals() {
  const globalState = yield select();
  const steps = globalState.project.projects[globalState.project.currentProjectById].steps;
  const step = steps.filter(s => s.id === globalState.project.currentProjectStepById)[0];
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


export const fetchProposalPosts = (proposalId) => {
  return {
    type: POSTS_FETCH_REQUESTED,
    proposalId,
  };
};

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
    // takeEvery(VOTES_FETCH_REQUESTED, fetchAllVotes),
    takeEvery(FETCH_REQUESTED, fetchProposals),
  ];
}

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case CHANGE_FILTER: {
      const filters = { ...this.state.filters, [action.filter]: action.value };
      return { ...state, filters, currentPaginationPage: 1 };
    }
    case CHANGE_ORDER:
      return { ...state, order: action.order, currentPaginationPage: 1 };
    case CHANGE_TERMS:
      return { ...state, terms: action.terms, currentPaginationPage: 1 };
    case SUBMIT_PROPOSAL_FORM:
      return { ...state, isCreating: true };
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
      return { ...state, currentVoteModal: null };
    case VOTE_REQUESTED:
      return { ...state, isVoting: true };
    case VOTE_FAILED:
      return { ...state, isVoting: false };
    case VOTE_SUCCEEDED: {
      console.log(action);
      const proposals = state.proposals;
      const proposal = proposals.filter(p => p.id = action.proposalId)[0];
      const index = proposals.indexOf(proposal);
      const previousVotes = proposal.votes || [];
      proposal.userHasVote = true;
      proposal.votes = previousVotes.push(action.vote);
      proposals[index] = proposal;
      return {
        ...state,
        proposals,
        isVoting: false,
        currentVoteModal: null,
        creditsLeft: state.creditsLeft - (action.vote.estimation || 0),
      };
    }
    case FETCH_REQUESTED:
      return { ...state, isLoading: true };
    case FETCH_SUCCEEDED:
      return { ...state, proposals: action.proposals, isLoading: false };
    case POSTS_FETCH_SUCCEEDED: {
      const posts = action.posts;
      const proposals = {
        [action.proposalId]: { ...state.proposals[action.proposalId], posts },
      };
      return { ...state, proposals };
    }
    case POSTS_FETCH_FAILED: {
      console.log(POSTS_FETCH_FAILED, action.error); // eslint-disable-line no-console
      return state;
    }
    default:
      return state;
  }
};
