import BaseStore from './BaseStore';
import {
  INIT_USER_REPLIES,
  RECEIVE_USER_REPLIES,
  CREATE_REPLY_SUCCESS,
  CREATE_REPLY_FAILURE,
  UPDATE_REPLY_SUCCESS,
  UPDATE_REPLY_FAILURE,
  DELETE_REPLY_SUCCESS,
  DELETE_REPLY_FAILURE
} from '../constants/ReplyConstants';

class ReplyStore extends BaseStore {
  constructor() {
    super();
    this.register(this._registerToActions.bind(this));
    this._userReplies = [];
  }

  _registerToActions(action) {
    switch (action.actionType) {
      case INIT_USER_REPLIES:
        this._userReplies = action.replies;
        this.emitChange();
        break;
      case RECEIVE_USER_REPLIES:
        this._userReplies = action.replies;
        this.emitChange();
        break;
      case CREATE_REPLY_SUCCESS:
        this.emitChange();
        break;
      case CREATE_REPLY_FAILURE:
        this.emitChange();
        break;
      case UPDATE_REPLY_SUCCESS:
        this.emitChange();
        break;
      case UPDATE_REPLY_FAILURE:
        this.emitChange();
        break;
      case DELETE_REPLY_SUCCESS:
        this.emitChange();
        break;
      case DELETE_REPLY_FAILURE:
        this.emitChange();
        break;
      default:
        break;
    }
  }

  get userReplies() {
    return this._userReplies;
  }
}

export default new ReplyStore();
