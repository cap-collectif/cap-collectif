import BaseStore from './BaseStore';
import {RECEIVE_PROPOSALS, RECEIVE_PROPOSAL} from '../constants/ProposalConstants';

class ProposalStore extends BaseStore {

  constructor() {
    super();
    this.register(this._registerToActions.bind(this));
    this._proposals = [];
  }

  _registerToActions(action) {
    switch (action.actionType) {
    case RECEIVE_PROPOSALS:
      this._proposals = action.proposals;
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
}

export default new ProposalStore();
