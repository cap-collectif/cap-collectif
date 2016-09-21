import Fetcher, { json } from '../../services/Fetcher';
import { takeEvery } from 'redux-saga';
import { select, call, put } from 'redux-saga/effects';
import FluxDispatcher from '../../dispatchers/AppDispatcher';
import { UPDATE_ALERT } from '../../constants/AlertConstants';

export const POSTS_FETCH_REQUESTED = 'proposal/POSTS_FETCH_REQUESTED';
export const POSTS_FETCH_SUCCEEDED = 'proposal/POSTS_FETCH_SUCCEEDED';
export const POSTS_FETCH_FAILED = 'proposal/POSTS_FETCH_FAILED';

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

const initialState = {
  currentProposalById: null,
  proposals: [],
  showVoteModal: false,
  isVoting: false,
  isLoading: true,
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

export const openVoteModal = () => {
  return {
    type: OPEN_VOTE_MODAL,
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

export const changeTerms = (terms) => {
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
      console.log('unknown step');
      return false;
  }
  Fetcher.post(url, data)
    .then(json)
    .then((newVote) => {
      dispatch(voteSuccess(proposal.id, newVote));
      dispatch(closeVoteModal());
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: { bsStyle: 'success', content: 'proposal.request.vote.success' },
      });
    })
    .catch((error) => {
      console.log(error);
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
      console.log('unknown step');
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

export function* fetchAllVotes(action) {
  // try {
  //   let hasMore = true;
  //   let iterationCount = 0;
  //   const votesPerIteration = 50;
  //   while (hasMore) {
  //     const result = yield call(
  //       Fetcher.get,
  //       `/ideas/${action.ideaId}/votes?offset=${iterationCount * votesPerIteration}&limit=${votesPerIteration}`
  //     );
  //     hasMore = result.hasMore;
  //     iterationCount++;
  //     yield put({ type: VOTES_FETCH_SUCCEEDED, votes: result.votes, ideaId: action.ideaId });
  //   }
  // } catch (e) {
  //   yield put({ type: VOTES_FETCH_FAILED, error: e });
  // }
}

export function* fetchProposals(action) {
  const state = yield select();
  let url = '';
  switch (action.fetchFrom) {
    case 'form':
      url = `/proposal_forms/${action.id}/proposals/search`;
      break;
    case 'selectionStep':
      url = `/selection_steps/${action.id}/proposals/search`;
      break;
    default:
      console.log('Unknown fetchFrom');
      return false;
  }
  url += `?page=${state.currentPaginationPage}&pagination=${PROPOSAL_PAGINATION}&order=${state.order}`;
  const result = yield call(
    Fetcher.postToJson,
    url,
    {
      terms: state.terms,
      tilfers: state.filters,
    },
  );
  console.log(result);
  yield put({ type: FETCH_SUCCEEDED, proposals: result.proposals });
}


export const fetchProposalPosts = (proposalId) => {
  return {
    type: POSTS_FETCH_REQUESTED,
    proposalId,
  };
};

export const loadProposals = (fetchFrom, id) => {
  return {
    type: FETCH_REQUESTED,
    fetchFrom,
    id,
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
      const filters = { ...this.state.filter, [action.filter]: action.value };
      return { ...state, filters, currentPaginationPage: 1 };
    }
    case CHANGE_ORDER:
      return { ...state, order: action.order, currentPaginationPage: 1 };
    case CHANGE_TERMS:
      return { ...state, terms: action.terms, currentPaginationPage: 1 };
    case OPEN_VOTE_MODAL:
      return { ...state, showVoteModal: true };
    case CLOSE_VOTE_MODAL:
      return { ...state, showVoteModal: false };
    case VOTE_REQUESTED:
      return { ...state, isVoting: true };
    case VOTE_FAILED:
      return { ...state, isVoting: false };
    case VOTE_SUCCEEDED: {
      const proposal = state.proposals[action.proposalId];
      const previousVotes = proposal.votes || [];
      const votes = previousVotes.push(action.vote);
      const proposals = {
        [action.proposalId]: { ...proposal, votes, userHasVote: true },
      };
      return { ...state, proposals, isVoting: false };
    }
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
