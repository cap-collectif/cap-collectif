// @flow
import type { Dispatch as ReduxDispatch } from 'redux';
import { UPDATE_OPINION_SUCCESS, UPDATE_OPINION_FAILURE } from '../../constants/OpinionConstants';
import FluxDispatcher from '../../dispatchers/AppDispatcher';
import Fetcher, { json } from '../../services/Fetcher';
import { takeEvery } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import _ from 'lodash';

export type VoteValue = -1 | 0 | 1;
type OpinionVote = {| user: { uniqueId: string }, value: VoteValue |};
type OpinionVotes = Array<OpinionVote>;
type Action =
    {| type: 'opinion/OPINION_VOTE_SUCCEEDED', opinionId: number, vote: OpinionVote |}
  | {| type: 'opinion/VERSION_VOTE_SUCCEEDED', versionId: number, vote: OpinionVote |}
  | {| type: 'opinion/DELETE_OPINION_VOTE_SUCCEEDED', opinionId: number, vote: OpinionVote |}
  | {| type: 'opinion/DELETE_VERSION_VOTE_SUCCEEDED', versionId: number, vote: OpinionVote |}
  | {| type: 'opinion/OPINION_VOTES_FETCH_SUCCEEDED', votes: OpinionVotes, opinionId: number |}
  | {| type: 'opinion/OPINION_VOTES_FETCH_FAILED', error: any |}
;
type FetchOpinionVotesAction = {| type: 'opinion/OPINION_VOTES_FETCH_REQUESTED', opinionId: number, versionId: ?number |};
type ContributionMap = {[id: number]: {votes: OpinionVotes, votesCount: number}};
type State = {
  currentOpinionId: ?number,
  currentVersionId: ?number,
  opinionsById: ContributionMap,
  versionsById: ContributionMap
};
type Dispatch = ReduxDispatch<Action>;

const VOTES_PREVIEW_COUNT = 8;
export const OPINION_VOTE_SUCCEEDED = 'opinion/OPINION_VOTE_SUCCEEDED';
export const VERSION_VOTE_SUCCEEDED = 'opinion/VERSION_VOTE_SUCCEEDED';
const DELETE_OPINION_VOTE_SUCCEEDED = 'opinion/DELETE_OPINION_VOTE_SUCCEEDED';
const DELETE_VERSION_VOTE_SUCCEEDED = 'opinion/DELETE_VERSION_VOTE_SUCCEEDED';
const OPINION_VOTES_FETCH_REQUESTED = 'opinion/OPINION_VOTES_FETCH_REQUESTED';
const OPINION_VOTES_FETCH_SUCCEEDED = 'opinion/OPINION_VOTES_FETCH_SUCCEEDED';
const OPINION_VOTES_FETCH_FAILED = 'opinion/OPINION_VOTES_FETCH_FAILED';

const initialState = {
  currentOpinionId: null,
  opinionsById: {},
  currentVersionId: null,
  versionsById: {},
};

export function* fetchAllOpinionVotes(action: FetchOpinionVotesAction): Generator<*, *, *> {
  try {
    let hasMore = true;
    let iterationCount = 0;
    const votesPerIteration = 30;
    const { opinionId, versionId } = action;
    while (hasMore) {
      const votesUrl = versionId
        ? `/opinions/${opinionId}/versions/${versionId}/votes?offset=${iterationCount * votesPerIteration}&limit=${votesPerIteration}`
        : `/opinions/${opinionId}/votes?offset=${iterationCount * votesPerIteration}&limit=${votesPerIteration}`;
      const result: {votes: OpinionVotes, hasMore: boolean} = yield call(Fetcher.get, votesUrl);
      hasMore = result.hasMore;
      iterationCount++;
      yield put({ type: OPINION_VOTES_FETCH_SUCCEEDED, votes: result.votes, opinionId });
    }
  } catch (e) {
    yield put({ type: OPINION_VOTES_FETCH_FAILED, error: e });
  }
}

export function* saga(): Generator<*, *, *> {
  yield* takeEvery(OPINION_VOTES_FETCH_REQUESTED, fetchAllOpinionVotes);
}

export const fetchOpinionVotes = (opinionId: number, versionId: number): FetchOpinionVotesAction => ({
  type: OPINION_VOTES_FETCH_REQUESTED,
  opinionId,
  versionId,
});

export const versionVoteSuccess = (versionId: number, vote: OpinionVote): Action => ({
  type: VERSION_VOTE_SUCCEEDED,
  versionId,
  vote,
});

export const opinionVoteSuccess = (opinionId: number, vote: OpinionVote): Action => ({
  type: OPINION_VOTE_SUCCEEDED,
  opinionId,
  vote,
});

export const deleteOpinionVoteSuccess = (opinionId: number, vote: OpinionVote): Action => ({
  type: DELETE_OPINION_VOTE_SUCCEEDED,
  opinionId,
  vote,
});

export const deleteVersionVoteSuccess = (versionId: number, vote: OpinionVote): Action => ({
  type: DELETE_VERSION_VOTE_SUCCEEDED,
  versionId,
  vote,
});

const deleteVote = (opinion: number, parent: ?number, dispatch: Dispatch): void => {
  const url = parent ? `/opinions/${parent}/versions/${opinion}/votes` : `/opinions/${opinion}/votes`;
  Fetcher
    .delete(url)
    .then(json)
    .then(data => {
      if (parent) {
        dispatch(deleteVersionVoteSuccess(opinion, data));
      } else {
        dispatch(deleteOpinionVoteSuccess(opinion, data));
      }
      FluxDispatcher.dispatch({
        actionType: UPDATE_OPINION_SUCCESS,
        message: 'opinion.request.delete_vote.success',
      });
    })
    .catch(e => {
      FluxDispatcher.dispatch({
        actionType: UPDATE_OPINION_FAILURE,
        message: 'opinion.request.failure',
      });
      console.error(e);
    });
};

const vote = (value: VoteValue, opinion: number, parent: ?number, dispatch: Dispatch): void => {
  const url = parent ? `/opinions/${parent}/versions/${opinion}/votes` : `/opinions/${opinion}/votes`;
  Fetcher
    .put(url, { value })
    .then(json)
    .then((newVote: OpinionVote) => {
      if (parent) {
        dispatch(versionVoteSuccess(opinion, newVote));
      } else {
        dispatch(opinionVoteSuccess(opinion, newVote));
      }
      FluxDispatcher.dispatch({
        actionType: UPDATE_OPINION_SUCCESS,
        message: 'opinion.request.create_vote.success',
      });
    })
    .catch(e => {
      FluxDispatcher.dispatch({
        actionType: UPDATE_OPINION_FAILURE,
        message: 'opinion.request.failure',
      });
      console.error(e);
    });
};

export const deleteVoteOpinion = (opinion: number, dispatch: Dispatch): void => (
  deleteVote(opinion, null, dispatch))
;

export const deleteVoteVersion = (version: number, opinion: number, dispatch: Dispatch): void => (
  deleteVote(version, opinion, dispatch)
);

export const voteOpinion = (value: VoteValue, opinion: number, dispatch: Dispatch): void => (
  vote(value, opinion, null, dispatch)
);

export const voteVersion = (value: VoteValue, version: number, opinion: number, dispatch: Dispatch): void => (
  vote(value, version, opinion, dispatch)
);

const updateOpinion = (state: State, opinion: Object): State => ({
  ...state,
  opinionsById: { ...state.opinionsById, [opinion.id]: opinion },
});

const updateVersion = (state: State, version: Object): State => ({
  ...state,
  versionsById: { ...state.versionsById, [version.id]: version },
});

const getVoteStringByValue = (value: VoteValue): string => {
  if (value === 1) return 'Ok';
  if (value === -1) return 'Nok';
  return 'Mitige';
};

const appendVote = (state: State, newVote: Object, object: Object, type: string): State => {
  const previousVote = _.find(object.votes, v => v.user.uniqueId === newVote.user.uniqueId);
  const voteCountIncreasing = `votesCount${getVoteStringByValue(newVote.value)}`;
  if (typeof previousVote === 'undefined') { // first vote
    const lol = {
      ...object,
      votes: [...object.votes, newVote],
      userHasVote: true,
      [voteCountIncreasing]: object[voteCountIncreasing] + 1,
      votesCount: object.votesCount + 1,
      user_vote: newVote.value,
    };
    return type === 'version' ? updateVersion(state, lol) : updateOpinion(state, lol);
  }
  const indexOfCurrentUserVote = _.findIndex(object.votes, v => v.user.uniqueId === newVote.user.uniqueId);
  object.votes.splice(indexOfCurrentUserVote, 1);
  const voteCountDecreasing = `votesCount${getVoteStringByValue(previousVote.value)}`;
  const lol = {
    ...object,
    votes: [...object.votes, newVote],
    [voteCountDecreasing]: object[voteCountDecreasing] - 1,
    [voteCountIncreasing]: object[voteCountIncreasing] + 1,
    user_vote: newVote.value,
  };
  return type === 'version' ? updateVersion(state, lol) : updateOpinion(state, lol);
};

const removeVote = (state: State, oldVote: Object, object: Object, type: string): State => {
  const indexToRemove = _.findIndex(object.votes, v => v.user && v.user.uniqueId === oldVote.user.uniqueId);
  const voteCountDecreasing = `votesCount${getVoteStringByValue(oldVote.value)}`;
  const lol = {
    ...object,
    votes: [...object.votes.slice(0, indexToRemove), ...object.votes.slice(indexToRemove + 1)],
    [voteCountDecreasing]: object[voteCountDecreasing] - 1,
    user_vote: null,
    userHasVote: false,
    votesCount: object.votesCount - 1,
  };
  return type === 'version' ? updateVersion(state, lol) : updateOpinion(state, lol);
};

export const reducer = (state: State = initialState, action: Action): State => {
  switch (action.type) {
    case OPINION_VOTES_FETCH_SUCCEEDED: {
      let votes = state.opinionsById[action.opinionId].votes;
      if (votes.length <= VOTES_PREVIEW_COUNT) {
        votes = []; // we remove preview votes
      }
      votes.push(...action.votes);
      return updateOpinion(state, { ...state.opinionsById[action.opinionId], votes });
    }
    case OPINION_VOTE_SUCCEEDED: {
      return appendVote(state, action.vote, state.opinionsById[action.opinionId], 'opinion');
    }
    case DELETE_OPINION_VOTE_SUCCEEDED: {
      return removeVote(state, action.vote, state.opinionsById[action.opinionId], 'opinion');
    }
    case VERSION_VOTE_SUCCEEDED: {
      return appendVote(state, action.vote, state.versionsById[action.versionId], 'version');
    }
    case DELETE_VERSION_VOTE_SUCCEEDED: {
      return removeVote(state, action.vote, state.versionsById[action.versionId], 'version');
    }
    case OPINION_VOTES_FETCH_FAILED: {
      console.log(OPINION_VOTES_FETCH_FAILED, action.error);
      return state;
    }
    default:
      return state;
  }
};
