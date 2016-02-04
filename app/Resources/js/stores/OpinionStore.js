import BaseStore from './BaseStore';
import ArrayHelper from '../services/ArrayHelper';
import {
  RECEIVE_OPINION,
  UPDATE_OPINION_SUCCESS,
  UPDATE_OPINION_FAILURE,
  CREATE_OPINION_VOTE,
  DELETE_OPINION_VOTE,
  RECEIVE_ARGUMENTS,
  CREATE_ARGUMENT_SUCCESS,
  CREATE_OPINION_VERSION_SUCCESS,
  CREATE_OPINION_VERSION_FAILURE,
  UPDATE_OPINION_VERSION_SUCCESS,
  UPDATE_OPINION_VERSION_FAILURE,
} from '../constants/OpinionConstants';

class OpinionStore extends BaseStore {

  constructor() {
    super();
    this.register(this._registerToActions.bind(this));
    this._isProcessing = false;
    this._opinion = null;
    this._rankingThreshold = null;
    this._opinionTerm = 0;
    this._isOpinionSync = false;
    this._areArgumentsSync = {
      0: true,
      1: true,
    };
    this._messages = {
      errors: [],
      success: [],
    };
  }

  _registerToActions(action) {
    let vote = {};
    const args = [];
    switch (action.actionType) {
      case RECEIVE_OPINION:
        this._opinion = action.opinion;
        this._rankingThreshold = action.rankingThreshold;
        this._opinionTerm = action.opinionTerm;
        this._isOpinionSync = true;
        this.emitChange();
        break;
      case CREATE_OPINION_VOTE:
        vote = {
          user: action.user,
          value: action.value,
        };
        if (this._opinion.user_vote !== null) {
          this._opinion.votes = ArrayHelper.removeElementFromArray(this._opinion.votes, vote, 'user', 'uniqueId');
          this._decreaseVoteCount(this._opinion.user_vote);
        }
        this._opinion.votes = ArrayHelper.addElementToArray(this._opinion.votes, vote, 'user', 'uniqueId');
        this._increaseVoteCount(vote.value);
        this._opinion.user_vote = vote.value;
        this.emitChange();
        break;
      case DELETE_OPINION_VOTE:
        if (this._opinion.user_vote !== null) {
          vote = this._opinion.votes[ArrayHelper.getElementIndexFromArray(this._opinion.votes, { user: action.user }, 'user', 'uniqueId')];
          this._opinion.votes = ArrayHelper.removeElementFromArray(this._opinion.votes, vote, 'user', 'uniqueId');
          this._decreaseVoteCount(vote.value);
        }
        this._opinion.user_vote = null;
        this.emitChange();
        break;
      case RECEIVE_ARGUMENTS:
        this._opinion.arguments.map((arg) => {
          if (arg.type !== action.type) {
            args.push(arg);
          }
        });
        this._opinion.arguments = args.concat(action.arguments);
        if (action.type === 0) {
          this._opinion.arguments_no_count = action.arguments.length;
        } else if (action.type === 1) {
          this._opinion.arguments_yes_count = action.arguments.length;
        }
        this._opinion.arguments_count = this._opinion.arguments_yes_count + this._opinion.arguments_no_count;
        this._areArgumentsSync[action.type] = true;
        this.emitChange();
        break;
      case CREATE_OPINION_VERSION_SUCCESS:
        this._isProcessing = false;
        this._resetArgumentsSync();
        this._isOpinionSync = false;
        break;
      case CREATE_OPINION_VERSION_FAILURE:
        this._isProcessing = false;
        this._resetArgumentsSync();
        this._isOpinionSync = false;
        break;
      case UPDATE_OPINION_VERSION_SUCCESS:
        this._isProcessing = false;
        this._resetArgumentsSync();
        this._isOpinionSync = false;
        break;
      case UPDATE_OPINION_VERSION_FAILURE:
        this._isProcessing = false;
        this._resetArgumentsSync();
        this._isOpinionSync = false;
        break;
      case CREATE_ARGUMENT_SUCCESS:
        this._isProcessing = false;
        this._areArgumentsSync[action.type] = false;
        this.emitChange();
        break;
      case UPDATE_OPINION_SUCCESS:
        this._resetMessages();
        this._messages.success.push(action.message);
        this._isProcessing = false;
        this.emitChange();
        break;
      case UPDATE_OPINION_FAILURE:
        this._messages.errors.push(action.message);
        this._messages.success = [];
        this._isProcessing = false;
        this._isOpinionSync = true;
        this.emitChange();
        break;
      default: break;
    }
  }

  get isProcessing() {
    return this._isProcessing;
  }

  get opinion() {
    return this._opinion;
  }

  get rankingThreshold() {
    return this._rankingThreshold;
  }

  get opinionTerm() {
    return this._opinionTerm;
  }

  get isOpinionSync() {
    return this._isOpinionSync;
  }

  get areArgumentsSync() {
    return this._areArgumentsSync;
  }

  get messages() {
    return this._messages;
  }

  _resetArgumentsSync() {
    this._areArgumentsSync[0] = false;
    this._areArgumentsSync[1] = false;
  }

  _resetMessages() {
    this._messages.errors = [];
    this._messages.success = [];
  }

  _decreaseVoteCount(value) {
    if (value === -1) {
      this._opinion.votes_nok = this._opinion.votes_nok - 1;
    } else if (value === 0) {
      this._opinion.votes_mitige = this._opinion.votes_mitige - 1;
    } else if (value === 1) {
      this._opinion.votes_ok = this._opinion.votes_ok - 1;
    }
    this._opinion.votes_total = this._opinion.votes_total - 1;
  }

  _increaseVoteCount(value) {
    if (value === -1) {
      this._opinion.votes_nok = this._opinion.votes_nok + 1;
    } else if (value === 0) {
      this._opinion.votes_mitige = this._opinion.votes_mitige + 1;
    } else if (value === 1) {
      this._opinion.votes_ok = this._opinion.votes_ok + 1;
    }
    this._opinion.votes_total = this._opinion.votes_total + 1;
  }

}

export default new OpinionStore();
