import BaseStore from './BaseStore';
import {
  RECEIVE_PROPOSALS,
  RECEIVE_PROPOSAL,
  RECEIVE_PROPOSAL_VOTES,
  RECEIVE_VOTABLE_STEPS,

  INIT_PROPOSAL_VOTES,
  INIT_VOTABLE_STEPS,
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
      case RECEIVE_VOTABLE_STEPS:
        this._votableSteps = action.votableSteps;
        this._isVotableStepsSync = true;
        this.emitChange();
        break;
      // case CREATE_PROPOSAL_VOTE:
      //   this._userHasVote = true;
      //   if (action.estimation) {
      //     this._creditsLeft -= action.estimation;
      //   }
      //   this.emitChange();
      //   break;
      // case CREATE_PROPOSAL_VOTE_SUCCESS:
      //   this._isProposalVotesListSync = false;
      //   this._isVotableStepsSync = false;
      //   this.emitChange();
      //   break;
      // case CREATE_PROPOSAL_VOTE_FAILURE:
      //   if (action.estimation) {
      //     this._creditsLeft += action.estimation;
      //   }
      //   this.emitChange();
      //   break;
      // case DELETE_PROPOSAL_VOTE:
      //   this._userHasVote = false;
      //   if (action.estimation) {
      //     this._creditsLeft += action.estimation;
      //   }
      //   this.emitChange();
      //   break;
      // case DELETE_PROPOSAL_VOTE_SUCCESS:
      //   this._isProposalVotesListSync = false;
      //   this._isVotableStepsSync = false;
      //   this.emitChange();
      //   break;
      // case DELETE_PROPOSAL_VOTE_FAILURE:
      //   if (action.estimation) {
      //     this._creditsLeft -= action.estimation;
      //   }
      //   this.emitChange();
      //   break;
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

}

export default new ProposalVoteStore();
