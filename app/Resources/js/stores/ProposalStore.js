import BaseStore from './BaseStore';
import LocalStorageService from '../services/LocalStorageService';
import {
  RECEIVE_PROPOSALS,
  RECEIVE_PROPOSAL,
  SUBMIT_PROPOSAL,
  VALIDATION_FAILURE,
  CREATE_PROPOSAL_SUCCESS,
  CREATE_PROPOSAL_FAILURE,
  UPDATE_PROPOSAL_SUCCESS,
  UPDATE_PROPOSAL_FAILURE,
  DELETE_PROPOSAL_SUCCESS,
  DELETE_PROPOSAL_FAILURE,
  CHANGE_PAGE,
  CHANGE_ORDER,
  CHANGE_SEARCH_TERMS,
  CHANGE_FILTERS,
} from '../constants/ProposalConstants';

class ProposalStore extends BaseStore {

  constructor() {
    super();
    this.register(this._registerToActions.bind(this));
    this._proposalsCount = 0;
    this._proposals = [];
    this._proposal = null;
    this._isProposalSync = false;
    this._isProcessing = false;
    this._order = LocalStorageService.get('proposals_order') || 'last';
    this._filters = LocalStorageService.get('proposals_filters') || {};
    this._terms = null;
    this._currentPage = 1;
    this._messages = {
      errors: [],
      success: [],
    };
  }

  initProposal(proposal) {
    this._proposal = proposal;
    this._isProposalSync = true;
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
      this._isProposalSync = true;
      this.emitChange();
      break;
    case SUBMIT_PROPOSAL:
      this._isProcessing = true;
      this.emitChange();
      break;
    case VALIDATION_FAILURE:
      this._isProcessing = false;
      this.emitChange();
      break;
    case CREATE_PROPOSAL_SUCCESS:
      this._isProcessing = false;
      this._resetMessages();
      this._messages.success.push(action.message);
      this.emitChange();
      break;
    case CREATE_PROPOSAL_FAILURE:
      this._isProcessing = false;
      this._messages.errors.push(action.message);
      this._messages.success = [];
      this.emitChange();
      break;
    case UPDATE_PROPOSAL_SUCCESS:
      this._isProcessing = false;
      this._resetMessages();
      this._messages.success.push(action.message);
      this._isProposalSync = false;
      this.emitChange();
      break;
    case UPDATE_PROPOSAL_FAILURE:
      this._isProcessing = false;
      this._messages.errors.push(action.message);
      this._messages.success = [];
      this._isProposalSync = false;
      this.emitChange();
      break;
    case DELETE_PROPOSAL_SUCCESS:
      this._isProcessing = false;
      this._resetMessages();
      this._messages.success.push(action.message);
      this.emitChange();
      break;
    case DELETE_PROPOSAL_FAILURE:
      this._isProcessing = false;
      this._messages.errors.push(action.message);
      this._messages.success = [];
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
    case CHANGE_SEARCH_TERMS:
      this._terms = action.terms;
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

  get isProposalSync() {
    return this._isProposalSync;
  }

  get order() {
    return this._order;
  }

  get terms() {
    return this._terms;
  }

  get filters() {
    return this._filters;
  }

  get currentPage() {
    return this._currentPage;
  }

  get isProcessing() {
    return this._isProcessing;
  }

  get messages() {
    return this._messages;
  }

  _resetMessages() {
    this._messages.errors = [];
    this._messages.success = [];
  }
}

export default new ProposalStore();
