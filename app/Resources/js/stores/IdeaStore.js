import BaseStore from './BaseStore';
import {
  DEFAULT_IDEAS_PAGINATION,
  SET_IDEAS_PAGINATION,
  INIT_IDEAS_COUNTS,
  INIT_IDEAS,
  CHANGE_IDEAS_PAGE,
  CHANGE_IDEAS_SEARCH_TERMS,
  CHANGE_IDEAS_ORDER,
  CHANGE_IDEAS_THEME,
  RECEIVE_IDEAS
} from '../constants/IdeaConstants';

class IdeaStore extends BaseStore {
  constructor() {
    super();
    this.register(this._registerToActions.bind(this));
    this._ideas = [];
    this._count = 0;
    this._countTrashed = 0;
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
      default:
        break;
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
}

export default new IdeaStore();
