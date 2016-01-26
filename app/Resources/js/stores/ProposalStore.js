import BaseStore from './BaseStore';
import LocalStorageService from '../services/LocalStorageService';
import LoginStore from './LoginStore';
import {
  RECEIVE_PROPOSALS,
  RECEIVE_PROPOSAL,
  RECEIVE_PROPOSAL_VOTES,
  SUBMIT_PROPOSAL,
  VALIDATION_FAILURE,

  CREATE_PROPOSAL_SUCCESS,
  CREATE_PROPOSAL_FAILURE,
  UPDATE_PROPOSAL_SUCCESS,
  UPDATE_PROPOSAL_FAILURE,
  DELETE_PROPOSAL_SUCCESS,
  DELETE_PROPOSAL_FAILURE,

  CREATE_PROPOSAL_VOTE,
  CREATE_PROPOSAL_VOTE_SUCCESS,
  CREATE_PROPOSAL_VOTE_FAILURE,
  DELETE_PROPOSAL_VOTE,
  DELETE_PROPOSAL_VOTE_SUCCESS,
  DELETE_PROPOSAL_VOTE_FAILURE,

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
    this._proposalVotes = [];
    this._proposal = null;
    this._userHasVote = false;
    this._votableStep = null;
    this._isProposalSync = false;
    this._isProposalListSync = false;
    this._isProposalVotesListSync = false;
    this._isProcessing = false;
    this._order = LocalStorageService.get('proposals_order') || 'votes';
    this._filters = LocalStorageService.get('proposals_filters') || {};
    this._terms = null;
    this._currentPage = 1;
    this._messages = {
      errors: [],
      success: [],
    };
  }

  initProposalData(proposal, userHasVote, votableStep) {
    this._proposal = proposal;
    this._userHasVote = userHasVote;
    this._votableStep = votableStep;
    this._isProposalSync = true;
  }

  _registerToActions(action) {
    switch (action.actionType) {
    case RECEIVE_PROPOSALS:
      this._proposals = action.proposals;
      this._proposalsCount = action.count;
      this._order = action.order;
      this._isProposalListSync = true;
      this.emitChange();
      break;
    case RECEIVE_PROPOSAL:
      this._proposal = action.proposal;
      this._userHasVote = action.userHasVote;
      this._votableStep = action.votableStep;
      this._isProposalSync = true;
      this.emitChange();
      break;
    case RECEIVE_PROPOSAL_VOTES:
      this._proposalVotes = action.votes;
      this._isProposalVotesListSync = true;
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
    case CREATE_PROPOSAL_VOTE:
      this._isProcessing = true;
      this._resetMessages();
      this._mockVote(action.proposal, action.selectionStep, action.hasComment);
      this.emitChange();
      break;
    case CREATE_PROPOSAL_VOTE_SUCCESS:
      this._isProcessing = false;
      this._messages.success.push(action.message);
      this._isProposalVotesListSync = false;
      this._isProposalListSync = false;
      this.emitChange();
      break;
    case CREATE_PROPOSAL_VOTE_FAILURE:
      this._isProcessing = false;
      this._messages.errors.push(action.message);
      this._messages.success = [];
      this._isProposalSync = false;
      this.emitChange();
      break;
    case DELETE_PROPOSAL_VOTE:
      this._isProcessing = true;
      this._mockDeleteVote(action.proposal, action.selectionStep);
      this._resetMessages();
      this.emitChange();
      break;
    case DELETE_PROPOSAL_VOTE_SUCCESS:
      this._isProcessing = false;
      this._messages.success.push(action.message);
      this._isProposalVotesListSync = false;
      this._isProposalListSync = false;
      this.emitChange();
      break;
    case DELETE_PROPOSAL_VOTE_FAILURE:
      this._isProcessing = false;
      this._messages.errors.push(action.message);
      this._messages.success = [];
      this._isProposalSync = false;
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

  get userHasVote() {
    return this._userHasVote;
  }

  get votableStep() {
    return this._votableStep;
  }

  get proposalVotes() {
    return this._proposalVotes;
  }

  get isProposalSync() {
    return this._isProposalSync;
  }

  get isProposalListSync() {
    return this._isProposalListSync;
  }

  get isProposalVotesListSync() {
    return this._isProposalVotesListSync;
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

  _mockVote(proposalId, selectionStepId, hasComment = false) {
    if (this._proposal && this._proposal.id === proposalId) {
      const votesCounts = this._proposal.votesCountBySelectionSteps;
      votesCounts[selectionStepId]++;
      this._proposal.votesCountBySelectionSteps = votesCounts;
      this._proposal.votesCount++;
      if (LoginStore.isLoggedIn()) {
        this._userHasVote = true;
      }
      if (hasComment) {
        this._proposal.comments_count++;
      }
    }
  }

  _mockDeleteVote(proposalId, selectionStepId) {
    if (this._proposal && this._proposal.id === proposalId) {
      const votesCounts = this._proposal.votesCountBySelectionSteps;
      votesCounts[selectionStepId]--;
      this._proposal.votesCountBySelectionSteps = votesCounts;
      this._proposal.votesCount--;
      if (LoginStore.isLoggedIn()) {
        this._userHasVote = false;
      }
    }
  }
}

export default new ProposalStore();
