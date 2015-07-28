import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher from '../services/Fetcher';
import {CREATE_OPINION_VERSION} from '../constants/OpinionVersionConstants';

export default {

  createVersion: (opinion, data) => {
    data.parent = opinion;
    return Fetcher
    .post('/opinions/' + opinion + '/version', data)
    .then(() => {
      AppDispatcher.dispatch({
        actionType: CREATE_OPINION_VERSION,
      });
      return true;
    });
  },

};
