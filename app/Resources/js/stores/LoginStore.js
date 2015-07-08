import {LOGIN_USER, LOGOUT_USER} from '../constants/LoginConstants';
import BaseStore from './BaseStore';

class LoginStore extends BaseStore {

  constructor() {
    super();
    this.register(this._registerToActions.bind(this));
    this._user = null;
    this._jwt = null;
  }

  _registerToActions(action) {
    switch(action.actionType) {
      case LOGIN_USER:
        this._jwt = action.jwt;
        this._user = action.user;
        this.emitChange();
        break;
      case LOGOUT_USER:
        this._jwt = null;
        this._user = null;
        this.emitChange();
        break;
      default:
        break;
    };
  }

  get user() {
    return this._user;
  }

  get jwt() {
    return this._jwt;
  }

  isLoggedIn() {
    return !!this._user;
  }
}

export default new LoginStore();
