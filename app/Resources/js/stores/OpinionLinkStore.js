import BaseStore from './BaseStore';
import { RECEIVE_LINKS } from '../constants/OpinionConstants';

class OpinionLinkStore extends BaseStore {
  constructor() {
    super();
    this.register(this._registerToActions.bind(this));
    this._links = [];
  }

  _registerToActions(action) {
    switch (action.actionType) {
      case RECEIVE_LINKS:
        this._links = action.links;
        this.emitChange();
        break;
      default:
        break;
    }
  }

  get links() {
    return this._links;
  }
}

export default new OpinionLinkStore();
