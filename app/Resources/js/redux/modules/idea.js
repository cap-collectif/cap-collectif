import Fetcher from '../../services/Fetcher';
import { takeEvery } from 'redux-saga';
import { call, put } from 'redux-saga/effects';

export const VOTES_PREVIEW_COUNT = 8;
export const VOTES_FETCH_REQUESTED = 'idea/VOTES_FETCH_REQUESTED';
export const VOTES_FETCH_SUCCEEDED = 'idea/VOTES_FETCH_SUCCEEDED';
export const VOTES_FETCH_FAILED = 'idea/VOTES_FETCH_FAILED';

const initialState = {
  currentIdeaById: null,
  ideas: [],
};

export const fetchIdeaVotes = (idea) => {
  return {
    type: VOTES_FETCH_REQUESTED,
    payload: {
      idea,
    },
  };
};

export function* fetchAllVotes(action) {
  try {
    let hasMore = true;
    let iterationCount = 0;
    const votesPerIteration = 50;
    while (hasMore) {
      const result = yield call(
        Fetcher.get,
        `/ideas/${action.payload.idea.id}/votes?offset=${iterationCount * votesPerIteration}&limit=${votesPerIteration}`
      );
      hasMore = result.hasMore;
      iterationCount++;
      yield put({ type: VOTES_FETCH_SUCCEEDED, votes: result.votes, ideaId: action.payload.idea.id });
    }
  } catch (e) {
    yield put({ type: VOTES_FETCH_FAILED });
  }
}

export function* saga() {
  yield* takeEvery(VOTES_FETCH_REQUESTED, fetchAllVotes);
}

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case VOTES_FETCH_SUCCEEDED: {
      let votes = state.ideas[action.ideaId].votes;
      if (votes.length <= 8) {
        votes = []; // we remove preview votes
      }
      for (const vote of action.votes) {
        votes.push(vote);
      }
      const ideas = {
        [action.ideaId]: { ...state.ideas[action.ideaId], votes },
      };
      return {
        ...state,
        ideas,
      };
    }
    case VOTES_FETCH_FAILED:
      console.log(VOTES_FETCH_FAILED); // eslint-disable-line no-console
      break;
    default:
      return state;
  }
};
