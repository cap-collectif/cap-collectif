import BaseStore from './BaseStore';
import {} from '../constants/OpinionLinkConstants';

class OpinionLinkStore extends BaseStore {

  constructor() {
    super();
    this.register(this._registerToActions.bind(this));
    this._opinionLinkCreationFormData = {};
    this._opinion = null;
    this._rankingThreshold = null;
    this._opinionTerm = 0;
    this._isOpinionSync = false;
    this._areArgumentsSync = {
      0: true,
      1: true,
    };
    this._messages = {
      errors: [],
      success: [],
    };
  }

  _registerToActions(action) {
    let vote = {};
    switch (action.actionType) {
      case RECEIVE_OPINION:
        this._opinion = action.opinion;
        this._rankingThreshold = action.rankingThreshold;
        this._opinionTerm = action.opinionTerm;
        this._isOpinionSync = true;
        this.emitChange();
        break;
      default: break;
    }
  }

}

export default new OpinionStore();
