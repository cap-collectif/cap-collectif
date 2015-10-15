import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher from '../services/Fetcher';
import {
  CREATE_OPINION_LINK_SUCCESS,
  CREATE_OPINION_LINK_FAILURE,
  UPDATE_OPINION_VERSION_SUCCESS,
  UPDATE_OPINION_VERSION_FAILURE,
} from '../constants/OpinionLinkConstants';

export default {

  add: (consultation, step, data) => {
    return Fetcher
    .post(`/consultations/${consultation}/steps/${step}/opinions`, data)
    .then((link) => {
      AppDispatcher.dispatch({
        actionType: CREATE_OPINION_LINK_SUCCESS,
      });
      return link.json();
    })
    .catch(() => {
      AppDispatcher.dispatch({
        actionType: CREATE_OPINION_LINK_FAILURE,
      });
    });
  },

};
