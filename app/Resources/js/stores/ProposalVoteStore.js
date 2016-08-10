import BaseStore from './BaseStore';
import {
  RECEIVE_PROPOSALS,
  RECEIVE_PROPOSAL,
  RECEIVE_PROPOSAL_VOTES,
  RECEIVE_VOTABLE_STEPS,

  INIT_PROPOSAL_VOTES,
  INIT_VOTABLE_STEPS,
  CREATE_PROPOSAL_VOTE,
  CREATE_PROPOSAL_VOTE_SUCCESS,
  CREATE_PROPOSAL_VOTE_FAILURE,
  DELETE_PROPOSAL_VOTE,
  DELETE_PROPOSAL_VOTE_SUCCESS,
  DELETE_PROPOSAL_VOTE_FAILURE,
} from '../constants/ProposalConstants';

class ProposalVoteStore extends BaseStore {

  constructor() {
    super();
    this.register(this._registerToActions.bind(this));
    this._creditsLeft = 0;
    this._proposalVotesByStepIds = {};
    this._votableSteps = [];
    this._votesCountByStepId = {};
    this._userHasVote = false;
    this._isProposalVotesListSync = false;
    this._isVotableStepsSync = false;
  }

  _registerToActions(action) {
    switch (action.actionType) {
      case INIT_PROPOSAL_VOTES:
        this._creditsLeft = action.creditsLeft;
        this._userHasVote = action.userHasVote;
        break;
      case INIT_VOTABLE_STEPS:
        this._votableSteps = action.votableSteps;
        this._isVotableStepsSync = true;
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

        this._proposalVotesByStepIds = { ...this._proposalVotesByStepIds, [action.stepId]: action.votes };
        this._isProposalVotesListSync = true;
        this._votesCountByStepId = { ...this._votesCountByStepId, [action.stepId]: action.votesCount };
        this.emitChange();
        break;
      case RECEIVE_VOTABLE_STEPS:
        this._votableSteps = action.votableSteps;
        this._isVotableStepsSync = true;
        this.emitChange();
        break;
      case CREATE_PROPOSAL_VOTE:
        this._userHasVote = true;
        if (action.estimation) {
          this._creditsLeft -= action.estimation;
        }
        this.emitChange();
        break;
      case CREATE_PROPOSAL_VOTE_SUCCESS:
        this._isProposalVotesListSync = false;
        this._isVotableStepsSync = false;
        this.emitChange();
        break;
      case CREATE_PROPOSAL_VOTE_FAILURE:
        if (action.estimation) {
          this._creditsLeft += action.estimation;
        }
        this.emitChange();
        break;
      case DELETE_PROPOSAL_VOTE:
        this._userHasVote = false;
        if (action.estimation) {
          this._creditsLeft += action.estimation;
        }
        this.emitChange();
        break;
      case DELETE_PROPOSAL_VOTE_SUCCESS:
        this._isProposalVotesListSync = false;
        this._isVotableStepsSync = false;
        this.emitChange();
        break;
      case DELETE_PROPOSAL_VOTE_FAILURE:
        if (action.estimation) {
          this._creditsLeft -= action.estimation;
        }
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

  proposalVotesByStepId(id) {
    return this._proposalVotesByStepIds[id] || [];
  }

  get votableSteps() {
    return this._votableSteps;
  }

  votesCountByStepId(id) {
    return this._votesCountByStepId[id] || 0;
  }

  get isProposalVotesListSync() {
    return this._isProposalVotesListSync;
  }

  get isVotableStepsSync() {
    return this._isVotableStepsSync;
  }
}

export default new ProposalVoteStore();
