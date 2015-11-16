import Fetcher from '../services/Fetcher';
import AppDispatcher from '../dispatchers/AppDispatcher';
import ProposalStore from '../stores/ProposalStore';
import {
  RECEIVE_PROPOSALS,
} from '../constants/ProposalConstants';

export default {

  getSearch: (terms = '', sort = 'score', type = 'all', page = 1) => {
    return Fetcher
      .get(`/search/${terms}/${sort}/${type}/${page}`, {})
      .then((data) => {
        AppDispatcher.dispatch({
          actionType: RECEIVE_PROPOSALS,
          proposals: data.results,
          count: data.count,
        });
        return true;
      });
  },

};
