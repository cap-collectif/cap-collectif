import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher from '../services/Fetcher';
import {CREATE_OPINION_VERSION, CREATE_OPINION_VERSION_VOTE} from '../constants/OpinionVersionConstants';

export default {

  createVersion: (opinion, data) => {
    return Fetcher
    .post(`/opinions/${opinion}/versions`, data)
    .then(() => {
      AppDispatcher.dispatch({
        actionType: CREATE_OPINION_VERSION,
      });
    });
  },

  voteForVersion: (opinion, version, data) => {
    AppDispatcher.dispatch({
      actionType: CREATE_OPINION_VERSION_VOTE,
    });
    return Fetcher
    .put(`/opinions/${opinion}/versions/${version}/votes`, data)
    .then(() => {
      return true;
    });
  },

  deleteVoteForVersion: (opinion, version) => {
    return Fetcher
    .delete(`/opinions/${opinion}/versions/${version}/votes`)
    .then(() => {
      return true;
    });
  },

  addVersionArgument: (opinion, version, data) => {
    return Fetcher
    .post(`/opinions/${opinion}/versions/${version}/arguments`, data)
    .then(() => {
      return true;
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
