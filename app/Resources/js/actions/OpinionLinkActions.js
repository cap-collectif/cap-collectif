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

  CREATE_OPINION_VERSION_SUCCESS,
  CREATE_OPINION_VERSION_FAILURE,
  UPDATE_OPINION_VERSION_SUCCESS,
  UPDATE_OPINION_VERSION_FAILURE,
} from '../constants/OpinionConstants';

export default {

  add: (opinion, data) => {
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

};
