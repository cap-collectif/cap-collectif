import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher from '../services/Fetcher';
import {
  CREATE_COMMENT_SUCCESS,
  CREATE_COMMENT_FAILURE,
  RECEIVE_COMMENTS
} from '../constants/CommentConstants';
import { UPDATE_ALERT } from '../constants/AlertConstants';

export default {
  create: (
    uri,
    object,
    data,
    successMessage = 'comment.submit_success',
    errorMessage = 'comment.submit_error'
  ) => {
    return Fetcher.post(`/${uri}/${object}/comments`, data)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: CREATE_COMMENT_SUCCESS,
          message: successMessage
        });
        return true;
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: CREATE_COMMENT_FAILURE,
          message: errorMessage
        });
        return false;
      });
  },

  loadFromServer: (uri, object, offset, limit, filter) => {
    Fetcher.get(`/${uri}/${object}/comments?offset=${offset}&limit=${limit}&filter=${filter}`).then(
      data => {
        data.actionType = RECEIVE_COMMENTS;
        AppDispatcher.dispatch(data);
        return true;
      }
    );
  },

  vote: comment => {
    return Fetcher.post(`/comments/${comment}/votes`, {})
      .then(() => {
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'alert.success.add.vote' }
        });
        return true;
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'danger', content: 'alert.danger.add.vote' }
        });
      });
  },

  deleteVote: comment => {
    return Fetcher.delete(`/comments/${comment}/votes`)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'alert.success.delete.vote' }
        });
        return true;
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'danger', content: 'alert.danger.delete.vote' }
        });
      });
  }
};
