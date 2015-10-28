import BaseStore from './BaseStore';
import {RECEIVE_PROPOSALS, RECEIVE_PROPOSAL} from '../constants/ProposalConstants';

class ProposalStore extends BaseStore {

  constructor() {
    super();
    this.register(this._registerToActions.bind(this));
    this._proposals = [];
    this._order = 'last';
  }

  _registerToActions(action) {
    switch (action.actionType) {
    case RECEIVE_PROPOSALS:
      this._proposals = action.proposals;
      this._order = action.order;
      this.emitChange();
      break;
    case RECEIVE_PROPOSAL:
      this._proposal = action.proposal;
      this.emitChange();
      break;
    default: break;
    }
  }

  get proposals() {
    return this._proposals;
  }

  get proposal() {
    return this._proposal;
  }

  get order() {
    return this._order;
  }
}

export default new ProposalStore();
