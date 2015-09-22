import {RECEIVE_OPINION} from '../constants/OpinionConstants';
import BaseStore from './BaseStore';

class OpinionStore extends BaseStore {

  constructor() {
    super();
    this.register(this._registerToActions.bind(this));
    this._opinion = null;
    this.rankingThreshold = null;
    this._opinions = [];
    this._isProcessing = false;
    this._isOpinionSync = false;
    this._isListSync = false;
    this._messages = {
      errors: [],
      success: [],
    };
  }

  _registerToActions(action) {
    switch (action.actionType) {
      case RECEIVE_OPINION:
        this._opinion = action.opinion;
        this._rankingThreshold = action.rankingThreshold;
        this._isOpinionSync = true;
        this.emitChange();
        break;
      default: break;
    }
  }

  get isProcessing() {
    return this._isProcessing;
  }

  get isOpinionSync() {
    return this._isOpinionSync;
  }

  get isListSync() {
    return this._isListSync;
  }

  get opinion() {
    return this._opinion;
  }

  get opinions() {
    return this._opinions;
  }

  get messages() {
    return this._messages;
  }

  _resetMessages() {
    this._messages.errors = [];
    this._messages.success = [];
  }

}

export default new OpinionStore();
