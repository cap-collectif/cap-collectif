import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher from '../services/Fetcher';
import { CREATE_COMMENT_SUCCESS, CREATE_COMMENT_FAILURE, RECEIVE_COMMENTS } from '../constants/CommentConstants';

export default {

  create: (uri, object, data, successMessage = 'comment.submit_success', errorMessage = 'comment.submit_error') => {
    return Fetcher
    .post('/' + uri + '/' + object + '/comments', data)
    .then(() => {
      AppDispatcher.dispatch({
        actionType: CREATE_COMMENT_SUCCESS,
        message: successMessage,
      });
      return true;
    })
    .catch(() => {
      AppDispatcher.dispatch({
        actionType: CREATE_COMMENT_FAILURE,
        message: errorMessage,
      });
      return false;
    });
  },

  loadFromServer: (uri, object, offset, limit, filter) => {
    Fetcher
    .get('/' + uri + '/' + object +
         '/comments?offset=' + offset +
         '&limit=' + limit +
         '&filter=' + filter
    )
    .then((data) => {
      data.actionType = RECEIVE_COMMENTS;
      AppDispatcher.dispatch(data);
      return true;
    });
  },

};
