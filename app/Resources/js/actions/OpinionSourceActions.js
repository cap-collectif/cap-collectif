import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher from '../services/Fetcher';
import {
  CREATE_OPINION_SOURCE_SUCCESS,
  CREATE_OPINION_SOURCE_FAILURE,
  UPDATE_OPINION_SOURCE_SUCCESS,
  UPDATE_OPINION_SOURCE_FAILURE,
  RECEIVE_SOURCES
} from '../constants/OpinionSourceConstants';

import { UPDATE_ALERT } from '../constants/AlertConstants';

const baseUrl = opinion => (opinion.parent ? `opinions/${opinion.parent.id}/versions` : 'opinions');

export default {
  load: (opinion, filter) => {
    return Fetcher.get(`/${baseUrl(opinion)}/${opinion.id}/sources?filter=${filter}`).then(data => {
      AppDispatcher.dispatch({
        actionType: RECEIVE_SOURCES,
        sources: data.sources,
        count: data.count,
        opinion,
        filter
      });
      return true;
    });
  },

  add: (opinion, data) => {
    return Fetcher.post(`/${baseUrl(opinion)}/${opinion.id}/sources`, data)
      .then(source => {
        AppDispatcher.dispatch({
          actionType: CREATE_OPINION_SOURCE_SUCCESS,
          source: source.json()
        });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'alert.success.add.source' }
        });
        return true;
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: CREATE_OPINION_SOURCE_FAILURE
        });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'danger', content: 'alert.danger.add.source' }
        });
      });
  },

  update: (opinion, source, data) => {
    return Fetcher.put(`/${baseUrl(opinion)}/${opinion.id}/sources/${source}`, data)
      .then(updatedSource => {
        AppDispatcher.dispatch({
          actionType: UPDATE_OPINION_SOURCE_SUCCESS,
          source: updatedSource.json()
        });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'alert.success.update.source' }
        });
        return true;
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: UPDATE_OPINION_SOURCE_FAILURE
        });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'danger', content: 'alert.danger.update.source' }
        });
      });
  },

  delete: (opinion, source) => {
    return Fetcher.delete(`/${baseUrl(opinion)}/${opinion.id}/sources/${source}`).then(() => {
      AppDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: { bsStyle: 'success', content: 'alert.success.delete.source' }
      });
    });
  }
};
