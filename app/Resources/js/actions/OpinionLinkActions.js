import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher from '../services/Fetcher';
import {CREATE_OPINION_LINK_SUCCESS, CREATE_OPINION_LINK_FAILURE} from '../constants/OpinionLinkConstants';

export default {

  add: (consultation, step, data) => {
    const tmpFixData = {
      OpinionType: data.type,
      title: data.title,
      body: data.body,
      link: data.link,
    };

    return Fetcher
    .post(`/consultations/${consultation}/steps/${step}/opinions`, tmpFixData)
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
