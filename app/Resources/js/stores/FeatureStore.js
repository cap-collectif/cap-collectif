import BaseStore from './BaseStore';
import { RECEIVE_FEATURES } from '../constants/FeatureConstants';

class FeatureStore extends BaseStore {

  constructor() {
    super();
    this.register(this._registerToActions.bind(this));
    this._features = {};
  }

  _registerToActions(action) {
    switch (action.actionType) {
      case RECEIVE_FEATURES:
        this._features = action.features;
        this.emitChange();
        break;
      default:
        break;
    }
  }

  isActive(key) {
    if (key in this._features) {
      return !!this._features[key];
    }
    return false;
  }

}

export default new FeatureStore();
