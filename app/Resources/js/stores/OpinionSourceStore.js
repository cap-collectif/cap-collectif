import BaseStore from './BaseStore';
import {
  RECEIVE_SOURCES,
  CREATE_SOURCE_SUCCESS,
  CREATE_SOURCE_FAILURE,
  UPDATE_SOURCE_SUCCESS,
  UPDATE_SOURCE_FAILURE
} from '../constants/OpinionSourceConstants';
import ArrayHelper from '../services/ArrayHelper';

class OpinionSourceStore extends BaseStore {
  constructor() {
    super();
    this.register(this._registerToActions.bind(this));
    this._opinion = {};
    this._sources = [];
    this._filter = 'last';
    this._count = undefined;
  }

  _registerToActions(action) {
    switch (action.actionType) {
      case RECEIVE_SOURCES:
        this._opinion = action.opinion;
        this._sources = action.sources;
        this._count = action.count;
        this._filter = action.filter;
        this.emitChange();
        break;
      case CREATE_SOURCE_SUCCESS:
        this._sources.push(action.source);
        this.emitChange();
        break;
      case CREATE_SOURCE_FAILURE:
        break;
      case UPDATE_SOURCE_SUCCESS:
        ArrayHelper.removeElementFromArray(this._sources, action.source);
        this._sources.push(action.source);
        this.emitChange();
        break;
      case UPDATE_SOURCE_FAILURE:
        break;
      default:
        break;
    }
  }

  get count() {
    return this._count;
  }

  get opinion() {
    return this._opinion;
  }

  get sources() {
    return this._sources;
  }

  get filter() {
    return this._filter;
  }
}

export default new OpinionSourceStore();
