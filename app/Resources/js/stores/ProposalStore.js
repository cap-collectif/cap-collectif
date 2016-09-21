import BaseStore from './BaseStore';
import {
  SUBMIT_PROPOSAL,
  PROPOSAL_VALIDATION_FAILURE,

  CREATE_PROPOSAL_SUCCESS,
  CREATE_PROPOSAL_FAILURE,
  UPDATE_PROPOSAL_SUCCESS,
  UPDATE_PROPOSAL_FAILURE,
  DELETE_PROPOSAL_SUCCESS,
  DELETE_PROPOSAL_FAILURE,

  CREATE_PROPOSAL_VOTE_SUCCESS,
  DELETE_PROPOSAL_VOTE_SUCCESS,
  DELETE_PROPOSAL_VOTE_FAILURE,
} from '../constants/ProposalConstants';

class ProposalStore extends BaseStore {

  constructor() {
    super();
    this.register(this._registerToActions.bind(this));
    this._isProposalListSync = false;
    this._isProcessing = false;
  }

  _registerToActions(action) {
    switch (action.actionType) {
      // case RECEIVE_PROPOSALS:
      //   this._proposals = action.proposals;
      //   this._proposalsCount = action.count;
      //   this._order = action.order;
      //   this._isProposalListSync = true;
      //   this.emitChange();
      //   break;
      case SUBMIT_PROPOSAL:
        this._isProcessing = true;
        this.emitChange();
        break;
      case PROPOSAL_VALIDATION_FAILURE:
        this._isProcessing = false;
        this.emitChange();
        break;
      case CREATE_PROPOSAL_SUCCESS:
        this._isProcessing = false;
        this.emitChange();
        break;
      case CREATE_PROPOSAL_FAILURE:
        this._isProcessing = false;
        this.emitChange();
        break;
      case UPDATE_PROPOSAL_SUCCESS:
        this._isProcessing = false;
        this._isProposalSync = false;
        this.emitChange();
        break;
      case UPDATE_PROPOSAL_FAILURE:
        this._isProcessing = false;
        this._isProposalSync = false;
        this.emitChange();
        break;
      case DELETE_PROPOSAL_SUCCESS:
        this._isProcessing = false;
        this.emitChange();
        break;
      case DELETE_PROPOSAL_FAILURE:
        this._isProcessing = false;
        this.emitChange();
        break;
      case CREATE_PROPOSAL_VOTE_SUCCESS:
        this._isProposalSync = false;
        this.emitChange();
        break;
      case DELETE_PROPOSAL_VOTE_SUCCESS:
        this._isProposalSync = false;
        this.emitChange();
        break;
      case DELETE_PROPOSAL_VOTE_FAILURE:
        this._isProposalSync = false;
        this.emitChange();
        break;
      default: break;
    }
  }

  get proposalsCount() {
    return this._proposalsCount;
  }

  get proposal() {
    return this._proposal;
  }

  get isProposalSync() {
    return this._isProposalSync;
  }

  get isProposalListSync() {
    return this._isProposalListSync;
  }

}

export default new ProposalStore();
