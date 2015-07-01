import {RECEIVE_COMMENTS, CREATE_COMMENT} from '../constants/CommentConstants';
import BaseStore from './BaseStore';

class CommentStore extends BaseStore {

  constructor() {
    super();
    this.register(this._registerToActions.bind(this));
    this._comments = [];
    this._commentsCount = 0;
    this._isSync = true;
  }

  _registerToActions(action) {
    switch(action.actionType) {
      case RECEIVE_COMMENTS:
        this._comments = action.comments;
        this._commentsCount = action.comments_total;
        this._isSync = true;
        this.emitChange();
        break;
      case CREATE_COMMENT:
        this._isSync = false;
        this.emitChange();
        break;
      default:
        break;
    };
  }

  get isSync() {
    return this._isSync;
  }

  get comments() {
    return this._comments;
  }

  get count() {
    return this._commentsCount;
  }

}

export default new CommentStore();
