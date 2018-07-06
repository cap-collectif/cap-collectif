import BaseStore from './BaseStore';
import ArrayHelper from '../services/ArrayHelper';
import {
  RECEIVE_ARGUMENTS,
  CHANGE_ARGUMENTS_SORT_ORDER,
  CREATE_ARGUMENT_SUCCESS,
  UPDATE_ARGUMENT_FAILURE,
  UPDATE_ARGUMENT_SUCCESS,
} from '../constants/ArgumentConstants';

class ArgumentStore extends BaseStore {
  constructor() {
    super();
    this.register(this._registerToActions.bind(this));
    this._opinion = {};
    this._arguments = {
      0: [],
      1: [],
    };
    this._countByType = {
      0: 0,
      1: 0,
    };
    this._orderByType = {
      0: 'last',
      1: 'last',
    };
  }

  _registerToActions(action) {
    switch (action.actionType) {
      case RECEIVE_ARGUMENTS:
        this._opinion = action.opinion;
        this._arguments[action.type] = action.arguments;
        this.countByType[action.type] = action.arguments.length;
        this.emitChange();
        break;
      case CHANGE_ARGUMENTS_SORT_ORDER:
        this._orderByType[action.type] = action.order;
        this.emitChange();
        break;
      case CREATE_ARGUMENT_SUCCESS:
        this._arguments[action.type].push(action.argument);
        this.emitChange();
        break;
      case UPDATE_ARGUMENT_SUCCESS:
        ArrayHelper.removeElementFromArray(this._arguments[action.type], action.argument);
        this._arguments[action.type].push(action.argument);
        this.emitChange();
        break;
      case UPDATE_ARGUMENT_FAILURE:
        break;
      default:
        break;
    }
  }

  get arguments() {
    return this._arguments;
  }

  get countByType() {
    return this._countByType;
  }

  get count() {
    return this._countByType[0] + this._countByType[1];
  }

  get orderByType() {
    return this._orderByType;
  }

  get opinion() {
    return this._opinion;
  }
}

export default new ArgumentStore();
