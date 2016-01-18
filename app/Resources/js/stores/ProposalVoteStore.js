import BaseStore from './BaseStore';
import {
  RECEIVE_PROPOSALS,
  RECEIVE_PROPOSAL,
  RECEIVE_PROPOSAL_VOTES,

  INIT_PROPOSAL_VOTES,
  CREATE_PROPOSAL_VOTE,
  CREATE_PROPOSAL_VOTE_SUCCESS,
  DELETE_PROPOSAL_VOTE,
  DELETE_PROPOSAL_VOTE_SUCCESS,
} from '../constants/ProposalConstants';

class ProposalVoteStore extends BaseStore {

  constructor() {
    super();
    this.register(this._registerToActions.bind(this));
    this._creditsLeft = 0;
    this._proposalVotes = [];
    this._votesCount = 0;
    this._userHasVote = false;
    this._isProposalVotesListSync = false;
  }

  _registerToActions(action) {
    switch (action.actionType) {
    case INIT_PROPOSAL_VOTES:
      this._creditsLeft = action.creditsLeft;
      this._userHasVote = action.userHasVote;
      break;
    case RECEIVE_PROPOSALS:
      this._creditsLeft = action.creditsLeft;
      this.emitChange();
      break;
    case RECEIVE_PROPOSAL:
      this._userHasVote = action.userHasVote;
      this._creditsLeft = action.creditsLeft;
      this.emitChange();
      break;
    case RECEIVE_PROPOSAL_VOTES:
      this._proposalVotes = action.votes;
      this._isProposalVotesListSync = true;
      this._votesCount = action.votesCount;
      this.emitChange();
      break;
    case CREATE_PROPOSAL_VOTE:
      this._userHasVote = true;
      this.emitChange();
      break;
    case CREATE_PROPOSAL_VOTE_SUCCESS:
      this._isProposalVotesListSync = false;
      this.emitChange();
      break;
    case DELETE_PROPOSAL_VOTE:
      this._userHasVote = false;
      this.emitChange();
      break;
    case DELETE_PROPOSAL_VOTE_SUCCESS:
      this._isProposalVotesListSync = false;
      this.emitChange();
      break;
    default: break;
    }
  }

  get userHasVote() {
    return this._userHasVote;
  }

  get creditsLeft() {
    return this._creditsLeft;
  }

  get proposalVotes() {
    return this._proposalVotes;
  }

  get votesCount() {
    return this._votesCount;
  }

  get isProposalVotesListSync() {
    return this._isProposalVotesListSync;
  }
}

export default new ProposalVoteStore();
