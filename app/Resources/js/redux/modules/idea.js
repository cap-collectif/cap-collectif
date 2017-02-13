import { takeEvery } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import { find, findLast } from 'lodash';
import Fetcher from '../../services/Fetcher';

export const VOTES_PREVIEW_COUNT = 8;
export const VOTES_FETCH_REQUESTED = 'idea/VOTES_FETCH_REQUESTED';
export const VOTES_FETCH_SUCCEEDED = 'idea/VOTES_FETCH_SUCCEEDED';
export const VOTES_FETCH_FAILED = 'idea/VOTES_FETCH_FAILED';
export const VOTE_SUCCEEDED = 'idea/VOTE_SUCCEEDED';
export const DELETE_VOTE_SUCCEEDED = 'idea/DELETE_VOTE_SUCCEEDED';

const initialState = {
  currentIdeaById: null,
  ideas: [],
};

export const deleteVoteSucceeded = (ideaId, vote) => {
  return {
    type: DELETE_VOTE_SUCCEEDED,
    ideaId,
    vote,
  };
};

export const fetchIdeaVotes = (ideaId) => {
  return {
    type: VOTES_FETCH_REQUESTED,
    ideaId,
  };
};

export const voteSuccess = (ideaId, vote) => {
  return {
    type: VOTE_SUCCEEDED,
    ideaId,
    vote,
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
        `/ideas/${action.ideaId}/votes?offset=${iterationCount * votesPerIteration}&limit=${votesPerIteration}`,
      );
      hasMore = result.hasMore;
      iterationCount++;
      yield put({ type: VOTES_FETCH_SUCCEEDED, votes: result.votes, ideaId: action.ideaId });
    }
  } catch (e) {
    yield put({ type: VOTES_FETCH_FAILED, error: e });
  }
}

export function* saga() {
  yield* takeEvery(VOTES_FETCH_REQUESTED, fetchAllVotes);
}

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case VOTES_FETCH_SUCCEEDED: {
      let votes = state.ideas[action.ideaId].votes;
      if (votes.length <= VOTES_PREVIEW_COUNT) {
        votes = []; // we remove preview votes
      }
      for (const vote of action.votes) {
        votes.push(vote);
      }
      const ideas = {
        [action.ideaId]: { ...state.ideas[action.ideaId], votes },
      };
      return { ...state, ideas };
    }
    case VOTE_SUCCEEDED: {
      const idea = state.ideas[action.ideaId];
      const ideas = {
        [action.ideaId]: {
          ...idea,
          ...{
            votes: [action.vote, ...idea.votes],
            userHasVote: true,
            votesCount: idea.votesCount + 1,
          },
        },
      };
      return { ...state, ideas };
    }
    case DELETE_VOTE_SUCCEEDED: {
      const idea = state.ideas[action.ideaId];
      let index = 0;
      if (action.vote.private) {
        index = idea.votes.indexOf(findLast(idea.votes, v => v.private));
      } else {
        index = idea.votes.indexOf(find(idea.votes, v => v.user && v.user.uniqId === action.vote.user.uniqId));
      }
      const ideas = {
        [action.ideaId]: {
          ...idea,
          ...{
            votes: [...idea.votes.slice(0, index), ...idea.votes.slice(index + 1)],
            userHasVote: false,
            votesCount: idea.votesCount - 1,
          },
        },
      };
      return { ...state, ideas };
    }
    case VOTES_FETCH_FAILED: {
      console.log(VOTES_FETCH_FAILED, action.error); // eslint-disable-line no-console
      return state;
    }
    default:
      return state;
  }
};
