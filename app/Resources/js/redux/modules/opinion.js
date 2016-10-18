import Fetcher, { json } from '../../services/Fetcher';
import FluxDispatcher from '../../dispatchers/AppDispatcher';
import { takeEvery } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import { find } from 'lodash';
import { UPDATE_OPINION_SUCCESS, UPDATE_OPINION_FAILURE } from '../../constants/OpinionConstants';

const VOTES_PREVIEW_COUNT = 8;

const OPINION_VOTE_SUCCEEDED = 'opinion/OPINION_VOTE_SUCCEEDED';
const VERSION_VOTE_SUCCEEDED = 'opinion/VERSION_VOTE_SUCCEEDED';
const DELETE_OPINION_VOTE_SUCCEEDED = 'opinion/DELETE_OPINION_VOTE_SUCCEEDED';
const DELETE_VERSION_VOTE_SUCCEEDED = 'opinion/DELETE_VERSION_VOTE_SUCCEEDED';

const OPINION_VOTES_FETCH_REQUESTED = 'opinion/OPINION_VOTES_FETCH_REQUESTED';
const OPINION_VOTES_FETCH_SUCCEEDED = 'opinion/OPINION_VOTES_FETCH_SUCCEEDED';
const OPINION_VOTES_FETCH_FAILED = 'opinion/OPINION_VOTES_FETCH_FAILED';

const initialState = {
  currentOpinionById: null,
  opinions: [],
  currentVersionById: null,
  versions: [],
};

export function* fetchAllOpinionVotes(action) {
  try {
    let hasMore = true;
    let iterationCount = 0;
    const votesPerIteration = 30;
    const votesUrl = action.versionId
      ? `/opinions/${action.opinionId}/versions/${action.versionId}/votes?offset=${iterationCount * votesPerIteration}&limit=${votesPerIteration}`
      : `/opinions/${action.opinionId}/votes?offset=${iterationCount * votesPerIteration}&limit=${votesPerIteration}`;
    while (hasMore) {
      const result = yield call(
        Fetcher.get,
        votesUrl
      );
      hasMore = result.hasMore;
      iterationCount++;
      yield put({ type: OPINION_VOTES_FETCH_SUCCEEDED, votes: result.votes, opinionId: action.opinionId });
    }
  } catch (e) {
    yield put({ type: OPINION_VOTES_FETCH_FAILED, error: e });
  }
}

export function* saga() {
  yield* takeEvery(OPINION_VOTES_FETCH_REQUESTED, fetchAllOpinionVotes);
}

export const fetchOpinionVotes = (opinionId, versionId) => {
  return {
    type: OPINION_VOTES_FETCH_REQUESTED,
    opinionId,
    versionId,
  };
};

const versionVoteSuccess = (versionId, vote) => {
  return {
    type: VERSION_VOTE_SUCCEEDED,
    versionId,
    vote,
  };
};

const opinionVoteSuccess = (opinionId, vote) => {
  return {
    type: OPINION_VOTE_SUCCEEDED,
    opinionId,
    vote,
  };
};

const deleteOpinionVoteSuccess = (opinionId, vote) => {
  return {
    type: DELETE_OPINION_VOTE_SUCCEEDED,
    opinionId,
    vote,
  };
};

const deleteVersionVoteSuccess = (versionId, vote) => {
  return {
    type: DELETE_VERSION_VOTE_SUCCEEDED,
    versionId,
    vote,
  };
};

const deleteVote = (opinion, parent, dispatch) => {
  const url = parent ? `/opinions/${parent}/versions/${opinion}/votes` : `/opinions/${opinion}/votes`;
  return Fetcher
    .delete(url)
    .then(json)
    .then((data) => {
      if (parent) {
        dispatch(deleteVersionVoteSuccess(opinion, data));
      } else {
        dispatch(deleteOpinionVoteSuccess(opinion, data));
      }
      FluxDispatcher.dispatch({
        actionType: UPDATE_OPINION_SUCCESS,
        message: 'opinion.request.delete_vote.success',
      });
    })
    .catch(() => {
      FluxDispatcher.dispatch({
        actionType: UPDATE_OPINION_FAILURE,
        message: 'opinion.request.failure',
      });
    });
};

const vote = (value, opinion, parent, dispatch) => {
  const url = parent ? `/opinions/${parent}/versions/${opinion}/votes` : `/opinions/${opinion}/votes`;
  return Fetcher
    .put(url, value)
    .then(json)
    .then(newVote => {
      if (parent) {
        dispatch(versionVoteSuccess(opinion, newVote));
      } else {
        dispatch(opinionVoteSuccess(opinion, newVote));
      }
      FluxDispatcher.dispatch({
        actionType: UPDATE_OPINION_SUCCESS,
        message: 'opinion.request.create_vote.success',
      });
    })
    .catch(() => {
      FluxDispatcher.dispatch({
        actionType: UPDATE_OPINION_FAILURE,
        message: 'opinion.request.failure',
      });
    });
};

export const deleteVoteOpinion = (opinion, dispatch) => {
  return deleteVote(opinion, null, dispatch);
};

export const deleteVoteVersion = (version, opinion, dispatch) => {
  return deleteVote(version, opinion, dispatch);
};

export const voteOpinion = (value, opinion, dispatch) => {
  return vote(value, opinion, null, dispatch);
};

export const voteVersion = (value, version, opinion, dispatch) => {
  return vote(value, version, opinion, dispatch);
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case OPINION_VOTES_FETCH_SUCCEEDED: {
      let votes = state.opinions[action.opinionId].votes || [];
      if (votes.length <= VOTES_PREVIEW_COUNT) {
        votes = []; // we remove preview votes
      }
      votes.push(...action.votes);
      const opinions = {
        [action.opinionId]: { ...state.opinions[action.opinionId], votes },
      };
      return { ...state, opinions };
    }
    case OPINION_VOTE_SUCCEEDED: {
      const opinion = state.opinions[action.opinionId];
      const indexOfCurrentUser = opinion.votes.indexOf(find(opinion.votes, (v) => {
        return v.user && v.user.uniqueId === action.vote.user.uniqueId;
      }));
      const opinions = {
        [action.opinionId]: {
          ...opinion,
          ...{
            ...state.opinions[action.opinionId],
            votes: indexOfCurrentUser === -1 ? [action.vote, ...opinion.votes] : opinion.votes,
            userHasVote: true,
            votesCount: indexOfCurrentUser === -1 ? opinion.votesCount + 1 : opinion.votesCount,
            user_vote: action.vote.value,
          },
        },
      };

      return { ...state, opinions };
    }
    case DELETE_OPINION_VOTE_SUCCEEDED: {
      const opinion = state.opinions[action.opinionId];
      const indexToRemove = opinion.votes.indexOf(find(opinion.votes, (v) => {
        return v.user && v.user.uniqueId === action.vote.user.uniqueId;
      }));
      const opinions = {
        [action.opinionId]: {
          ...opinion,
          votes: [...opinion.votes.slice(0, indexToRemove), ...opinion.votes.slice(indexToRemove + 1)],
          user_vote: null,
          userHasVote: false,
          votesCount: opinion.votesCount - 1,
        },
      };
      return { ...state, opinions };
    }
    case VERSION_VOTE_SUCCEEDED: {
      const versions = {
        [action.versionId]: {
          ...state.versions[action.versionId],
          user_vote: action.vote.value,
          userHasVote: true,
        },
      };
      return { ...state, versions };
    }
    case DELETE_VERSION_VOTE_SUCCEEDED: {
      const versions = {
        [action.versionId]: {
          ...state.versions[action.versionId],
          user_vote: null,
          userHasVote: false,
        },
      };
      return { ...state, versions };
    }
    case OPINION_VOTES_FETCH_FAILED: {
      console.log(OPINION_VOTES_FETCH_FAILED, action.error); // eslint-disable-line no-console
      return state;
    }
    default:
      return state;
  }
};
