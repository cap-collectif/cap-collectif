import BaseStore from './BaseStore';
import {
  RECEIVE_OPINION,
  UPDATE_OPINION_SUCCESS,
  UPDATE_OPINION_FAILURE,
  CREATE_OPINION_VERSION_SUCCESS,
  CREATE_OPINION_VERSION_FAILURE,
  UPDATE_OPINION_VERSION_SUCCESS,
  UPDATE_OPINION_VERSION_FAILURE,
  DELETE_OPINION_VERSION_SUCCESS,
  DELETE_OPINION_VERSION_FAILURE,
} from '../constants/OpinionConstants';

class OpinionStore extends BaseStore {
  constructor() {
    super();
    this.register(this._registerToActions.bind(this));
    this._isProcessing = false;
    this._opinion = null;
    this._rankingThreshold = null;
    this._opinionTerm = 0;
    this._isOpinionSync = false;
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
        this._opinionTerm = action.opinionTerm;
        this._isOpinionSync = true;
        this.emitChange();
        break;
      case CREATE_OPINION_VERSION_SUCCESS:
        this._isProcessing = false;
        this._isOpinionSync = false;
        break;
      case CREATE_OPINION_VERSION_FAILURE:
        this._isProcessing = false;
        this._isOpinionSync = false;
        break;
      case UPDATE_OPINION_VERSION_SUCCESS:
        this._isProcessing = false;
        this._isOpinionSync = false;
        break;
      case UPDATE_OPINION_VERSION_FAILURE:
        this._isProcessing = false;
        this._isOpinionSync = false;
        break;
      case DELETE_OPINION_VERSION_SUCCESS:
        this._isProcessing = false;
        this._isOpinionSync = false;
        break;
      case DELETE_OPINION_VERSION_FAILURE:
        this._isProcessing = false;
        this._isOpinionSync = false;
        break;
      case UPDATE_OPINION_SUCCESS:
        this._resetMessages();
        this._messages.success.push(action.message);
        this.emitChange();
        break;
      case UPDATE_OPINION_FAILURE:
        this._messages.errors.push(action.message);
        this._messages.success = [];
        this.emitChange();
        break;
      default:
        break;
    }
  }

  get isProcessing() {
    return this._isProcessing;
  }

  get opinion() {
    return this._opinion;
  }

  get rankingThreshold() {
    return this._rankingThreshold;
  }

  get opinionTerm() {
    return this._opinionTerm;
  }

  get isOpinionSync() {
    return this._isOpinionSync;
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
