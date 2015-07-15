import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher from '../services/Fetcher';
import {CREATE_COMMENT, RECEIVE_COMMENTS} from '../constants/CommentConstants';

export default {

  create: (uri, object, data) => {
    return Fetcher
    .post('/' + uri + '/' + object + '/comments', data)
    .then(() => {
      AppDispatcher.dispatch({
        actionType: CREATE_COMMENT
      });
      return true;
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
