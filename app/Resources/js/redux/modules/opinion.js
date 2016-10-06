import Fetcher, { json } from '../../services/Fetcher';
import FluxDispatcher from '../../dispatchers/AppDispatcher';
import { UPDATE_OPINION_SUCCESS, UPDATE_OPINION_FAILURE } from '../../constants/OpinionConstants';

const OPINION_VOTE_SUCCEEDED = 'opinion/OPINION_VOTE_SUCCEEDED';
const VERSION_VOTE_SUCCEEDED = 'opinion/VERSION_VOTE_SUCCEEDED';
const DELETE_OPINION_VOTE_SUCCEEDED = 'opinion/DELETE_OPINION_VOTE_SUCCEEDED';
const DELETE_VERSION_VOTE_SUCCEEDED = 'opinion/DELETE_VERSION_VOTE_SUCCEEDED';

const initialState = {
  currentOpinionById: null,
  opinions: [],
  currentVersionById: null,
  versions: [],
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

const deleteOpinionVoteSuccess = (opinionId) => {
  return {
    type: DELETE_OPINION_VOTE_SUCCEEDED,
    opinionId,
  };
};

const deleteVersionVoteSuccess = (versionId) => {
  return {
    type: DELETE_VERSION_VOTE_SUCCEEDED,
    versionId,
  };
};

const deleteVote = (opinion, parent, dispatch) => {
  const url = parent ? `/opinions/${parent}/versions/${opinion}/votes` : `/opinions/${opinion}/votes`;
  return Fetcher
    .delete(url)
    .then(() => {
      if (parent) {
        dispatch(deleteVersionVoteSuccess(opinion));
      } else {
        dispatch(deleteOpinionVoteSuccess(opinion));
      }
      FluxDispatcher.dispatch({
        actionType: UPDATE_OPINION_SUCCESS,
        message: 'opinion.request.delete_vote.success',
      });
      location.reload();
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
      location.reload();
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
  return vote(value, null, opinion, dispatch);
};

export const voteVersion = (value, version, opinion, dispatch) => {
  return vote(value, version, opinion, dispatch);
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case OPINION_VOTE_SUCCEEDED: {
      const opinions = {
        [action.opinionId]: {
          ...state.opinions[action.opinionId],
          user_vote: action.vote.value,
        },
      };
      return { ...state, opinions };
    }
    case DELETE_OPINION_VOTE_SUCCEEDED: {
      const opinions = {
        [action.opinionId]: {
          ...state.opinions[action.opinionId],
          user_vote: null,
        },
      };
      return { ...state, opinions };
    }
    case VERSION_VOTE_SUCCEEDED: {
      const versions = {
        [action.versionId]: {
          ...state.versions[action.versionId],
          user_vote: action.vote.value,
        },
      };
      return { ...state, versions };
    }
    case DELETE_VERSION_VOTE_SUCCEEDED: {
      const versions = {
        [action.versionId]: {
          ...state.versions[action.versionId],
          user_vote: null,
        },
      };
      return { ...state, versions };
    }
    default:
      return state;
  }
};
