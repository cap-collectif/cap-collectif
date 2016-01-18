import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher from '../services/Fetcher';
import {
  CREATE_OPINION_SOURCE_SUCCESS,
  CREATE_OPINION_SOURCE_FAILURE,
  UPDATE_OPINION_SOURCE_SUCCESS,
  UPDATE_OPINION_SOURCE_FAILURE,
  RECEIVE_SOURCES,
} from '../constants/OpinionSourceConstants';

const baseUrl = (opinion) => opinion.parent ? `opinions/${opinion.parent.id}/versions` : 'opinions';

export default {

  load: (opinion, filter) => {
    return Fetcher
      .get(`/${baseUrl(opinion)}/${opinion.id}/sources?filter=${filter}`)
      .then((data) => {
        AppDispatcher.dispatch({
          actionType: RECEIVE_SOURCES,
          sources: data.sources,
          count: data.count,
          opinion: opinion,
          filter: filter,
        });
        return true;
      });
  },

  add: (opinion, data) => {
    delete data.check;
    const tmpFixData = data;
    tmpFixData.Category = parseInt(data.category, 10);
    delete tmpFixData.category;
    delete tmpFixData.check;
    return Fetcher
    .post(`/${baseUrl(opinion)}/${opinion.id}/sources`, tmpFixData)
    .then((source) => {
      AppDispatcher.dispatch({
        actionType: CREATE_OPINION_SOURCE_SUCCESS,
        source: source.json(),
      });
      return true;
    })
    .catch(() => {
      AppDispatcher.dispatch({
        actionType: CREATE_OPINION_SOURCE_FAILURE,
      });
    });
  },

  update: (opinion, source, data) => {
    delete data.check;
    const tmpFixData = data;
    tmpFixData.Category = parseInt(data.category, 10);
    delete tmpFixData.category;
    delete tmpFixData.check;
    return Fetcher
    .put(`/${baseUrl(opinion)}/${opinion.id}/sources/${source}`, tmpFixData)
    .then((updatedSource) => {
      AppDispatcher.dispatch({
        actionType: UPDATE_OPINION_SOURCE_SUCCESS,
        source: updatedSource.json(),
      });
      return true;
    })
    .catch(() => {
      AppDispatcher.dispatch({
        actionType: UPDATE_OPINION_SOURCE_FAILURE,
      });
    });
  },

  delete: (opinion, source) => {
    return Fetcher.delete(`/${baseUrl(opinion)}/${opinion.id}/sources/${source}`);
  },

  report: (opinion, source, data) => {
    return Fetcher.post(`/${baseUrl(opinion)}/${opinion.id}/sources/${source}/reports`, data);
  },

};
