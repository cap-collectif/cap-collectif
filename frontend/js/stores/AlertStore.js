// @flow
import BaseStore from './BaseStore';
import { UPDATE_ALERT } from '../constants/AlertConstants';

class AlertStore extends BaseStore {
  _alert: any;

  constructor() {
    super();
    this.register(this._registerToActions.bind(this));
    this._alert = null;
  }

  _registerToActions(action: any) {
    switch (action.actionType) {
      case UPDATE_ALERT:
        this._alert = action.alert;
        this.emitChange();
        break;
      default:
        break;
    }
  }

  get alert() {
    return this._alert;
  }
}

export default new AlertStore();
