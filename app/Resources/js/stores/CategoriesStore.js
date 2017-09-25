import BaseStore from './BaseStore';
import { RECEIVE_CATEGORIES } from '../constants/CategoriesConstants';

class CategoriesStore extends BaseStore {
  constructor() {
    super();
    this.register(this._registerToActions.bind(this));
    this._categories = [];
  }

  _registerToActions(action) {
    switch (action.actionType) {
      case RECEIVE_CATEGORIES:
        this._categories = action.categories;
        this.emitChange();
        break;
      default:
        break;
    }
  }

  get categories() {
    return this._categories;
  }
}

export default new CategoriesStore();
