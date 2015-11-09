import BaseStore from './BaseStore';
import {
  RECEIVE_PROPOSALS,
  RECEIVE_PROPOSAL,
  CHANGE_PAGE,
  CHANGE_ORDER,
  CHANGE_FILTERS,
} from '../constants/ProposalConstants';

class ProposalStore extends BaseStore {

  constructor() {
    super();
    this.register(this._registerToActions.bind(this));
    this._proposalsCount = 0;
    this._proposals = [];
    this._order = 'last';
    this._filters = {};
    this._currentPage = 1;
  }

  _registerToActions(action) {
    switch (action.actionType) {
    case RECEIVE_PROPOSALS:
      this._proposals = action.proposals;
      this._proposalsCount = action.count;
      this.emitChange();
      break;
    case RECEIVE_PROPOSAL:
      this._proposal = action.proposal;
      this.emitChange();
      break;
    case CHANGE_PAGE:
      this._currentPage = action.page;
      this.emitChange();
      break;
    case CHANGE_ORDER:
      this._order = action.order;
      this._currentPage = 1;
      this.emitChange();
      break;
    case CHANGE_FILTERS:
      this._filters[action.filter] = action.value;
      this._currentPage = 1;
      this.emitChange();
      break;
    default: break;
    }
  }

  get proposals() {
    return this._proposals;
  }

  get proposalsCount() {
    return this._proposalsCount;
  }

  get proposal() {
    return this._proposal;
  }

  get order() {
    return this._order;
  }

  get filters() {
    return this._filters;
  }

  get currentPage() {
    return this._currentPage;
  }
}

export default new ProposalStore();
