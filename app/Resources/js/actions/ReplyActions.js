import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher from '../services/Fetcher';
import {
  INIT_USER_REPLIES,
  RECEIVE_USER_REPLIES,
  CREATE_REPLY_SUCCESS,
  CREATE_REPLY_FAILURE,
  UPDATE_REPLY_SUCCESS,
  UPDATE_REPLY_FAILURE,
  DELETE_REPLY_SUCCESS,
  DELETE_REPLY_FAILURE,
} from '../constants/ReplyConstants';
import { UPDATE_ALERT } from '../constants/AlertConstants';

export default {
  initUserReplies: userReplies => {
    AppDispatcher.dispatch({
      actionType: INIT_USER_REPLIES,
      replies: userReplies,
    });
    return true;
  },

  loadUserReplies: id => {
    Fetcher.get(`/questionnaires/${id}/replies`).then(result => {
      AppDispatcher.dispatch({
        actionType: RECEIVE_USER_REPLIES,
        replies: result.replies,
      });
      return true;
    });
  },

  add: (form, data) => {
    return Fetcher.post(`/questionnaires/${form}/replies`, data)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: CREATE_REPLY_SUCCESS,
        });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'reply.request.create.success' },
        });
        return true;
      })
  },

  update: (form, reply, data) => {
    return Fetcher.put(`/questionnaires/${form}/replies/${reply}`, data)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: UPDATE_REPLY_SUCCESS,
        });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'reply.request.update.success' },
        });
        return true;
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: UPDATE_REPLY_FAILURE,
        });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'warning', content: 'reply.request.update.failure' },
        });
        return false;
      });
  },

  delete: (form, reply) => {
    return Fetcher.delete(`/questionnaires/${form}/replies/${reply}`)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: DELETE_REPLY_SUCCESS,
        });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'reply.request.delete.success' },
        });
        return true;
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: DELETE_REPLY_FAILURE,
        });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'warning', content: 'reply.request.delete.failure' },
        });
        return false;
      });
  },
};
