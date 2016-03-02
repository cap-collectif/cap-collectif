import AppDispatcher from '../dispatchers/AppDispatcher';
import LoginStore from '../stores/LoginStore';
import Fetcher from '../services/Fetcher';
import {
  RECEIVE_OPINION,
  DELETE_OPINION_SUCCESS,
  DELETE_OPINION_FAILURE,
  UPDATE_OPINION_SUCCESS,
  UPDATE_OPINION_FAILURE,
  CREATE_OPINION_VOTE,
  DELETE_OPINION_VOTE,
  CREATE_OPINION_VERSION_SUCCESS,
  CREATE_OPINION_VERSION_FAILURE,
  UPDATE_OPINION_VERSION_SUCCESS,
  UPDATE_OPINION_VERSION_FAILURE,
  DELETE_OPINION_VERSION_SUCCESS,
  DELETE_OPINION_VERSION_FAILURE,
} from '../constants/OpinionConstants';

export default {

  loadOpinion: (opinionId, versionId) => {
    const url = versionId ? `/opinions/${opinionId}/versions/${versionId}` : `/opinions/${opinionId}`;
    Fetcher
      .get(url)
      .then((data) => {
        AppDispatcher.dispatch({
          actionType: RECEIVE_OPINION,
          opinion: data.opinion ? data.opinion : data.version,
          rankingThreshold: data.rankingThreshold,
          opinionTerm: data.opinionTerm,
        });
        return true;
      });
  },

  deleteOpinion: (opinion) => {
    return Fetcher
      .delete(`/opinions/${opinion}`)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: DELETE_OPINION_SUCCESS,
        });
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: DELETE_OPINION_FAILURE,
        });
      });
  },

  // Vote for opinion or version

  loadAllVotes: (opinionId, versionId) => {
    const url = versionId ? `/opinions/${opinionId}/versions/${versionId}/votes` : `/opinions/${opinionId}/votes`;
    return Fetcher
      .get(url)
      .then((data) => {
        return data.votes;
      })
    ;
  },

  vote: (data, opinion, parent, successMessage = 'opinion.request.create_vote.success', errorMessage = 'opinion.request.failure') => {
    AppDispatcher.dispatch({
      actionType: CREATE_OPINION_VOTE,
      value: data.value,
      user: LoginStore.user,
    });
    const url = parent ? `/opinions/${parent}/versions/${opinion}/votes` : `/opinions/${opinion}/votes`;
    return Fetcher
    .put(url, data)
    .then(() => {
      AppDispatcher.dispatch({
        actionType: UPDATE_OPINION_SUCCESS,
        message: successMessage,
      });
      return true;
    })
    .catch(() => {
      AppDispatcher.dispatch({
        actionType: UPDATE_OPINION_FAILURE,
        message: errorMessage,
      });
    });
  },

  deleteVote: (opinion, parent, successMessage = 'opinion.request.delete_vote.success', errorMessage = 'opinion.request.failure') => {
    AppDispatcher.dispatch({
      actionType: DELETE_OPINION_VOTE,
      user: LoginStore.user,
    });
    const url = parent ? `/opinions/${parent}/versions/${opinion}/votes` : `/opinions/${opinion}/votes`;
    return Fetcher
      .delete(url)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: UPDATE_OPINION_SUCCESS,
          message: successMessage,
        });
        return true;
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: UPDATE_OPINION_FAILURE,
          message: errorMessage,
        });
      });
  },

  // Create or update versions

  createVersion: (opinion, data) => {
    return Fetcher
    .post(`/opinions/${opinion}/versions`, data)
    .then((version) => {
      AppDispatcher.dispatch({
        actionType: CREATE_OPINION_VERSION_SUCCESS,
      });
      return version.json();
    })
    .catch(() => {
      AppDispatcher.dispatch({
        actionType: CREATE_OPINION_VERSION_FAILURE,
      });
    });
  },

  updateVersion: (opinion, version, data) => {
    return Fetcher
      .put(`/opinions/${opinion}/versions/${version}`, data)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: UPDATE_OPINION_VERSION_SUCCESS,
        });
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: UPDATE_OPINION_VERSION_FAILURE,
        });
      });
  },

  deleteVersion: (opinion, version) => {
    return Fetcher
      .delete(`/opinions/${opinion}/versions/${version}`)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: DELETE_OPINION_VERSION_SUCCESS,
        });
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: DELETE_OPINION_VERSION_FAILURE,
        });
      });
  },

  addVersionSource: (opinion, version, data) => {
    return Fetcher
    .post(`/opinions/${opinion}/versions/${version}/sources`, data)
    .then(() => {
      return true;
    });
  },

};
