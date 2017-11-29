import {
  RECEIVE_COMMENTS,
  CREATE_COMMENT_SUCCESS,
  CREATE_COMMENT_FAILURE,
} from '../constants/CommentConstants';
import BaseStore from './BaseStore';

class CommentStore extends BaseStore {
  constructor() {
    super();
    this.register(this._registerToActions.bind(this));
    this._comments = [];
    this._commentsCount = 0;
    this._commentsAndAnswersCount = 0;
    this._isSync = true;
    this._messages = {
      errors: [],
      success: [],
    };
  }

  _registerToActions(action) {
    switch (action.actionType) {
      case RECEIVE_COMMENTS:
        this._comments = action.comments;
        this._commentsCount = action._commentsCount;
        this._commentsAndAnswersCount = action._commentsTotal;
        this._commentsAndAnswersCount = action._commentsAndAnswersCount;
        this._isSync = true;
        this.emitChange();
        break;
      case CREATE_COMMENT_SUCCESS:
        this._resetMessages();
        if (action.message) {
          this._messages.success.push(action.message);
        }
        this._isSync = false;
        this.emitChange();
        break;
      case CREATE_COMMENT_FAILURE:
        this._resetMessages();
        this._messages.errors.push(action.message);
        this.emitChange();
        break;
      default:
        break;
    }
  }

  get isSync() {
    return this._isSync;
  }

  get comments() {
    return this._comments;
  }

  get countWithAnswers() {
    return this._commentsAndAnswersCount;
  }

  get count() {
    return this._commentsCount;
  }

  get messages() {
    return this._messages;
  }

  _resetMessages() {
    this._messages.errors = [];
    this._messages.success = [];
  }
}

export default new CommentStore();
