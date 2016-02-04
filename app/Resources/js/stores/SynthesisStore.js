import { DISPLAY_SETTINGS } from '../constants/SynthesisDisplayConstants';
import BaseStore from './BaseStore';

class SynthesisStore extends BaseStore {

  constructor() {
    super();
    this._settings = DISPLAY_SETTINGS;
  }

  get settings() {
    return this._settings;
  }

}

export default new SynthesisStore();
