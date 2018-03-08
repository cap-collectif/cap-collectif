import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher from '../services/Fetcher';
import { DELETE_REPLY_SUCCESS, DELETE_REPLY_FAILURE } from '../constants/ReplyConstants';
import { UPDATE_ALERT } from '../constants/AlertConstants';

export default {
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
