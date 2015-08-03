import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher from '../services/Fetcher';
import {CREATE_OPINION_VERSION} from '../constants/OpinionVersionConstants';

export default {

  createVersion: (opinion, data) => {
    return Fetcher
    .post('/opinions/' + opinion + '/versions', data)
    .then(() => {
      AppDispatcher.dispatch({
        actionType: CREATE_OPINION_VERSION,
      });
    });
  },

};
