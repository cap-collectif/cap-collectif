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

  voteForVersion: (opinion, version, data) => {
    return Fetcher
    .put('/opinions/' + opinion + '/versions/' + version + '/votes', data)
    .then(() => {
      return true;
    });
  },


};
