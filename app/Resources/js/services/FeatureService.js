import FeatureActions from '../actions/FeatureActions';
import LocalStorageService from './LocalStorageService';

class FeatureService {

  load() {
    if (LocalStorageService.isValid('flags')) {
      FeatureActions.loadFromCache();
      return;
    }

    this.refresh();
  }

  refresh() {
    FeatureActions.loadFromServer();
  }

}

export default new FeatureService();
