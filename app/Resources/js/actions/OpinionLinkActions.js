import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher from '../services/Fetcher';
import {
  CREATE_OPINION_LINK_SUCCESS,
  CREATE_OPINION_LINK_FAILURE,
  RECEIVE_LINKS,
} from '../constants/OpinionLinkConstants';

export default {
  add: (project, step, data) => {
    const tmpFixData = {
      OpinionType: data.type,
      title: data.title,
      body: data.body,
      link: data.link,
      appendices: data.appendices,
    };

    return Fetcher.post(`/projects/${project}/steps/${step}/opinions`, tmpFixData)
      .then(link => {
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

  load: (opinion, filter) => {
    return Fetcher.get(`/opinions/${opinion}/links?filter=${filter}`).then(data => {
      AppDispatcher.dispatch({
        actionType: RECEIVE_LINKS,
        links: data.links,
      });
      return true;
    });
  },
};
