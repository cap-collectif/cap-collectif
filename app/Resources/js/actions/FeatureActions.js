import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher from '../services/Fetcher';
import { RECEIVE_FEATURES } from '../constants/FeatureConstants';
import LocalStorageService from '../services/LocalStorageService';

export default {

  loadFromServer: () => {
    Fetcher
    .get('/features')
    .then((features) => {
      AppDispatcher.dispatch({
        actionType: RECEIVE_FEATURES,
        features: features,
      });
      LocalStorageService.set('flags', features);
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
