import Fetcher, { json } from '../../services/Fetcher';
import { takeEvery } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import FluxDispatcher from '../../dispatchers/AppDispatcher';
import { UPDATE_ALERT } from '../../constants/AlertConstants';

export const POSTS_FETCH_REQUESTED = 'proposal/POSTS_FETCH_REQUESTED';
export const POSTS_FETCH_SUCCEEDED = 'proposal/POSTS_FETCH_SUCCEEDED';
export const POSTS_FETCH_FAILED = 'proposal/POSTS_FETCH_FAILED';

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

const initialState = {
  currentProposalById: null,
  proposals: [],
  showVoteModal: false,
  isVoting: false,
};

// const voteFailed = () => {
//   AppDispatcher.dispatch({
//     actionType: CREATE_PROPOSAL_VOTE_FAILURE,
//     estimation,
//   });
//   }
// };

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
    .then((vote) => {
      dispatch(voteSuccess(proposal.id, vote));
      dispatch(closeVoteModal());
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: { bsStyle: 'success', content: 'proposal.request.vote.success' },
      });
    })
    .catch((error) => {
      console.log(error);
      // dispatch(voteFailed());
      // FluxDispacher.dispatch({
      //   actionType: CREATE_PROPOSAL_VOTE_FAILURE,
      // });
    });
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
  try {
    let hasMore = true;
    let iterationCount = 0;
    const votesPerIteration = 50;
    while (hasMore) {
      const result = yield call(
        Fetcher.get,
        `/ideas/${action.ideaId}/votes?offset=${iterationCount * votesPerIteration}&limit=${votesPerIteration}`
      );
      hasMore = result.hasMore;
      iterationCount++;
      yield put({ type: VOTES_FETCH_SUCCEEDED, votes: result.votes, ideaId: action.ideaId });
    }
  } catch (e) {
    yield put({ type: VOTES_FETCH_FAILED, error: e });
  }
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
  yield* takeEvery(POSTS_FETCH_REQUESTED, fetchPosts);
  yield* takeEvery(VOTES_FETCH_REQUESTED, fetchAllVotes);
}

export const reducer = (state = initialState, action) => {
  switch (action.type) {
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
