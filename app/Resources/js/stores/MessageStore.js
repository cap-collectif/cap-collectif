import BaseStore from './BaseStore';
import {
  CREATE_PROPOSAL_SUCCESS,
  CREATE_PROPOSAL_FAILURE,
  UPDATE_PROPOSAL_SUCCESS,
  UPDATE_PROPOSAL_FAILURE,
  DELETE_PROPOSAL_SUCCESS,
  DELETE_PROPOSAL_FAILURE,

  CREATE_PROPOSAL_VOTE,
  CREATE_PROPOSAL_VOTE_SUCCESS,
  CREATE_PROPOSAL_VOTE_FAILURE,
  DELETE_PROPOSAL_VOTE,
  DELETE_PROPOSAL_VOTE_SUCCESS,
  DELETE_PROPOSAL_VOTE_FAILURE,
} from '../constants/ProposalConstants';

class MessageStore extends BaseStore {

  constructor() {
    super();
    this.register(this._registerToActions.bind(this));
    this._messages = {
      errors: [],
      success: [],
    };
  }

  _registerToActions(action) {
    switch (action.actionType) {
    case CREATE_PROPOSAL_SUCCESS:
      this._resetMessages();
      this._messages.success.push(action.message);
      this.emitChange();
      break;
    case CREATE_PROPOSAL_FAILURE:
      this._messages.errors.push(action.message);
      this._messages.success = [];
      this.emitChange();
      break;
    case UPDATE_PROPOSAL_SUCCESS:
      this._resetMessages();
      this._messages.success.push(action.message);
      this.emitChange();
      break;
    case UPDATE_PROPOSAL_FAILURE:
      this._messages.errors.push(action.message);
      this._messages.success = [];
      this.emitChange();
      break;
    case DELETE_PROPOSAL_SUCCESS:
      this._resetMessages();
      this._messages.success.push(action.message);
      this.emitChange();
      break;
    case DELETE_PROPOSAL_FAILURE:
      this._messages.errors.push(action.message);
      this._messages.success = [];
      this.emitChange();
      break;
    case CREATE_PROPOSAL_VOTE:
      this._resetMessages();
      this.emitChange();
      break;
    case CREATE_PROPOSAL_VOTE_SUCCESS:
      this._messages.success.push(action.message);
      this.emitChange();
      break;
    case CREATE_PROPOSAL_VOTE_FAILURE:
      this._messages.errors.push(action.message);
      this._messages.success = [];
      this.emitChange();
      break;
    case DELETE_PROPOSAL_VOTE:
      this._resetMessages();
      this.emitChange();
      break;
    case DELETE_PROPOSAL_VOTE_SUCCESS:
      this._messages.success.push(action.message);
      this.emitChange();
      break;
    case DELETE_PROPOSAL_VOTE_FAILURE:
      this._messages.errors.push(action.message);
      this._messages.success = [];
      this.emitChange();
      break;
    default: break;
    }
  }

  get messages() {
    return this._messages;
  }

  _resetMessages() {
    this._messages.errors = [];
    this._messages.success = [];
  }
}

export default new MessageStore();
