import Fetcher from '../../services/Fetcher';
import { takeEvery } from 'redux-saga';
import { call, put } from 'redux-saga/effects';

export const POSTS_FETCH_REQUESTED = 'proposal/POSTS_FETCH_REQUESTED';
export const POSTS_FETCH_SUCCEEDED = 'proposal/POSTS_FETCH_SUCCEEDED';
export const POSTS_FETCH_FAILED = 'proposal/POSTS_FETCH_FAILED';

const initialState = {
  currentProposalById: null,
  proposals: [],
};

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
}

export const reducer = (state = initialState, action) => {
  switch (action.type) {
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
