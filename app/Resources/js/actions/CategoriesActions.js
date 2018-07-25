import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher from '../services/Fetcher';
import { RECEIVE_CATEGORIES } from '../constants/CategoriesConstants';

export default {
  load: () => {
    Fetcher.get('/categories').then(categories => {
      AppDispatcher.dispatch({
        actionType: RECEIVE_CATEGORIES,
        categories,
      });
      return true;
    });
  },
};
