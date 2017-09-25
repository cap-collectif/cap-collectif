import { DISPLAY_SETTINGS } from '../constants/SynthesisDisplayConstants';
import BaseStore from './BaseStore';
import * as Actions from '../constants/SynthesisActionsConstants';

class SynthesisStore extends BaseStore {
  constructor() {
    super();
    this.register(this._registerToActions.bind(this));
    this._settings = DISPLAY_SETTINGS;
    this._synthesis = null;
  }

  _registerToActions(action) {
    switch (action.actionType) {
      case Actions.RECEIVE_SYNTHESIS:
        this._synthesis = action.synthesis;
        this.emitChange();
        break;
      default:
        break;
    }
  }

  get settings() {
    return this._settings;
  }

  get synthesis() {
    return this._synthesis;
  }
}

export default new SynthesisStore();
