import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher from '../services/Fetcher';
import {RECEIVE_FEATURES} from '../constants/FeatureConstants';
import LocalStorageService from '../services/LocalStorageService';

export default {

  loadFromServer: () => {
    Fetcher
    .get(`features`)
    .then((data) => {
      data.actionType = RECEIVE_FEATURES;
      AppDispatcher.dispatch(data);
      LocalStorageService.set('flags', data);
      return true;
    });
  },

  loadFromCache: () => {
    AppDispatcher.dispatch({
      features: LocalStorageService.get('flags'),
      actionType: RECEIVE_FEATURES,
    });
  },

};
