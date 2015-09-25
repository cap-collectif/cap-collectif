import AppDispatcher from '../dispatchers/AppDispatcher';
import LoginStore from '../stores/LoginStore';
import Fetcher from '../services/Fetcher';
import {
  RECEIVE_OPINION,
  UPDATE_OPINION_SUCCESS,
  UPDATE_OPINION_FAILURE,
  CREATE_OPINION_VOTE,
  DELETE_OPINION_VOTE,
  RECEIVE_ARGUMENTS,
  CREATE_ARGUMENT_SUCCESS,

  CREATE_OPINION_VERSION,
  UPDATE_OPINION_VERSION,
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
        });
        return true;
      });
  },

  // Vote for opinion or version

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

  // Arguments

  loadArguments: (opinion, type, filter) => {
    const baseUrl = opinion.parent ? '/versions/' : '/opinions/';
    return Fetcher
      .get(`${baseUrl}${opinion.id}/arguments?type=${type}&filter=${filter}`)
      .then((data) => {
        AppDispatcher.dispatch({
          actionType: RECEIVE_ARGUMENTS,
          arguments: data.arguments,
          type: type,
        });
        return true;
      });
  },

  addArgument: (opinion, data) => {
    const baseUrl = opinion.parent ? `/opinions/${opinion.parent.id}/versions/${opinion.id}` : `/opinions/${opinion.id}`;
    return Fetcher
      .post(`${baseUrl}/arguments`, data)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: CREATE_ARGUMENT_SUCCESS,
          type: data.type,
        });
        return true;
      });
  },

  // Create or update versions

  createVersion: (opinion, data) => {
    return Fetcher
    .post(`/opinions/${opinion}/versions`, data)
    .then(() => {
      AppDispatcher.dispatch({
        actionType: CREATE_OPINION_VERSION,
      });
    });
  },

  updateVersion: (opinion, version, data) => {
    return Fetcher
      .put(`/opinions/${opinion}/versions/${version}`, data)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: UPDATE_OPINION_VERSION,
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

  addSource: (opinion, data) => {
    return Fetcher
    .post(`/opinions/${opinion}/sources`, data)
    .then(() => {
      return true;
    });
  },

};
