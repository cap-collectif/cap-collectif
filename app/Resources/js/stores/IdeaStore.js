import BaseStore from './BaseStore';
import {
  DEFAULT_IDEAS_PAGINATION,
  SET_IDEAS_PAGINATION,
  INIT_IDEAS_COUNTS,
  INIT_IDEA,
  INIT_IDEAS,

  CHANGE_IDEAS_PAGE,
  CHANGE_IDEAS_SEARCH_TERMS,
  CHANGE_IDEAS_ORDER,
  CHANGE_IDEAS_THEME,

  CREATE_IDEA_VOTE_SUCCESS,
  DELETE_IDEA_VOTE_SUCCESS,

  REPORT_IDEA_SUCCESS,

  RECEIVE_IDEAS,
  RECEIVE_IDEA,
  RECEIVE_IDEA_VOTES,
} from '../constants/IdeaConstants';

class IdeaStore extends BaseStore {

  constructor() {
    super();
    this.register(this._registerToActions.bind(this));
    this._ideas = [];
    this._count = 0;
    this._countTrashed = 0;
    this._idea = null;
    this._pagination = DEFAULT_IDEAS_PAGINATION;
    this._currentPage = 1;
    this._terms = null;
    this._order = 'last';
    this._theme = null;
    this._votes = [];
    this._votesCount = 0;
  }

  _registerToActions(action) {
    switch (action.actionType) {
      case INIT_IDEA:
        this._idea = action.idea;
        this.emitChange();
        break;
      case SET_IDEAS_PAGINATION:
        this._pagination = action.pagination;
        this.emitChange();
        break;
      case INIT_IDEAS:
        this._ideas = action.ideas;
        this.emitChange();
        break;
      case INIT_IDEAS_COUNTS:
        this._count = action.count;
        this._countTrashed = action.countTrashed;
        this.emitChange();
        break;
      case RECEIVE_IDEAS:
        this._ideas = action.ideas;
        this._count = action.count;
        this._countTrashed = action.countTrashed;
        this.emitChange();
        break;
      case RECEIVE_IDEA:
        this._idea = action.idea;
        this.emitChange();
        break;
      case RECEIVE_IDEA_VOTES:
        this._votes = action.votes;
        this._votesCount = action.votesCount;
        this.emitChange();
        break;
      case CHANGE_IDEAS_PAGE:
        this._currentPage = action.page;
        this.emitChange();
        break;
      case CHANGE_IDEAS_ORDER:
        this._order = action.order;
        this._currentPage = 1;
        this.emitChange();
        break;
      case CHANGE_IDEAS_THEME:
        this._theme = action.theme;
        this._currentPage = 1;
        this.emitChange();
        break;
      case CHANGE_IDEAS_SEARCH_TERMS:
        this._terms = action.terms;
        this._currentPage = 1;
        this.emitChange();
        break;
      case CREATE_IDEA_VOTE_SUCCESS:
        this._idea.userHasVote = true;
        this._idea.votesCount++;
        if (action.hasComment) {
          this._idea.commentsCount++;
        }
        this.emitChange();
        break;
      case DELETE_IDEA_VOTE_SUCCESS:
        this._idea.userHasVote = false;
        this._idea.votesCount--;
        this.emitChange();
        break;
      case REPORT_IDEA_SUCCESS:
        this._idea.userHasReport = true;
        this.emitChange();
        break;
      default: break;
    }
  }

  get ideas() {
    return this._ideas;
  }

  get count() {
    return this._count;
  }

  get countTrashed() {
    return this._countTrashed;
  }

  get idea() {
    return this._idea;
  }

  get pagination() {
    return this._pagination;
  }

  get currentPage() {
    return this._currentPage;
  }

  get terms() {
    return this._terms;
  }

  get order() {
    return this._order;
  }

  get theme() {
    return this._theme;
  }

  get votes() {
    return this._votes;
  }

  get votesCount() {
    return this._votesCount;
  }
}

export default new IdeaStore();
