// @flow
import { takeEvery } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import { UPDATE_OPINION_SUCCESS, UPDATE_OPINION_FAILURE } from '../../constants/OpinionConstants';
import FluxDispatcher from '../../dispatchers/AppDispatcher';
import Fetcher, { json } from '../../services/Fetcher';
import type { Version, Opinion, VoteValue, Uuid, Dispatch, Action } from '../../types';

type OpinionVote = { user: { uniqueId: string }, value: VoteValue };
type OpinionVotes = Array<OpinionVote>;
type StartCreateOpinionVersionAction = { type: 'opinion/START_CREATE_OPINION_VERSION' };
type CancelCreateOpinionVersionAction = { type: 'opinion/CANCEL_CREATE_OPINION_VERSION' };
type ShowOpinionVersionEditModalAction = { type: 'opinion/SHOW_OPINION_VERSION_EDIT_MODAL' };
type CloseOpinionVersionEditModalAction = { type: 'opinion/CLOSE_OPINION_VERSION_EDIT_MODAL' };
type ShowOpinionVersionCreateModalAction = { type: 'opinion/SHOW_OPINION_VERSION_CREATE_MODAL' };
type CloseOpinionVersionCreateModalAction = { type: 'opinion/CLOSE_OPINION_VERSION_CREATE_MODAL' };
export type OpinionAction =
    { type: 'opinion/OPINION_VOTE_SUCCEEDED', opinionId: Uuid, vote: OpinionVote }
  | { type: 'opinion/VERSION_VOTE_SUCCEEDED', versionId: Uuid, vote: OpinionVote }
  | { type: 'opinion/DELETE_OPINION_VOTE_SUCCEEDED', opinionId: Uuid, vote: OpinionVote }
  | { type: 'opinion/DELETE_VERSION_VOTE_SUCCEEDED', versionId: Uuid, vote: OpinionVote }
  | { type: 'opinion/OPINION_VOTES_FETCH_SUCCEEDED', votes: OpinionVotes, opinionId: Uuid }
  | { type: 'opinion/OPINION_VOTES_FETCH_FAILED', error: Object }
  | ShowOpinionVersionEditModalAction
  | CloseOpinionVersionEditModalAction
  | ShowOpinionVersionCreateModalAction
  | CloseOpinionVersionCreateModalAction
  | StartCreateOpinionVersionAction
  | CancelCreateOpinionVersionAction
;
type FetchOpinionVotesAction = { type: 'opinion/OPINION_VOTES_FETCH_REQUESTED', opinionId: Uuid, versionId: ?Uuid };
type ContributionMap = {[id: Uuid]: {
  id: string,
  votes: OpinionVotes,
  votesCount: number,
  user_vote: ?VoteValue
}};
export type State = {
  currentOpinionId: ?Uuid,
  currentVersionId: ?Uuid,
  opinionsById: ContributionMap,
  versionsById: ContributionMap
};

const VOTES_PREVIEW_COUNT = 8;
export const OPINION_VOTE_SUCCEEDED = 'opinion/OPINION_VOTE_SUCCEEDED';
export const VERSION_VOTE_SUCCEEDED = 'opinion/VERSION_VOTE_SUCCEEDED';
export const DELETE_OPINION_VOTE_SUCCEEDED = 'opinion/DELETE_OPINION_VOTE_SUCCEEDED';
export const DELETE_VERSION_VOTE_SUCCEEDED = 'opinion/DELETE_VERSION_VOTE_SUCCEEDED';
export const OPINION_VOTES_FETCH_REQUESTED = 'opinion/OPINION_VOTES_FETCH_REQUESTED';
export const OPINION_VOTES_FETCH_SUCCEEDED = 'opinion/OPINION_VOTES_FETCH_SUCCEEDED';
export const OPINION_VOTES_FETCH_FAILED = 'opinion/OPINION_VOTES_FETCH_FAILED';

const initialState: State = {
  currentOpinionId: null,
  opinionsById: {},
  currentVersionId: null,
  versionsById: {},
  isEditingOpinionVersion: false,
  showOpinionVersionEditModal: false,
  isCreatingOpinionVersion: false,
  showOpinionVersionCreateModal: false,
};

const startCreatingOpinionVersion = () => ({ type: 'opinion/START_CREATE_OPINION_VERSION' });
const cancelCreatingOpinionVersion = () => ({ type: 'opinion/CANCEL_CREATE_OPINION_VERSION' });
export const showOpinionVersionEditModal = (): ShowOpinionVersionEditModalAction => ({ type: 'opinion/SHOW_OPINION_VERSION_EDIT_MODAL' });
export const closeOpinionVersionEditModal = (): CloseOpinionVersionEditModalAction => ({ type: 'opinion/CLOSE_OPINION_VERSION_EDIT_MODAL' });
export const closeOpinionVersionCreateModal = (): CloseOpinionVersionCreateModalAction => ({ type: 'opinion/CLOSE_OPINION_VERSION_CREATE_MODAL' });
export const showOpinionVersionCreateModal = (): ShowOpinionVersionCreateModalAction => ({ type: 'opinion/SHOW_OPINION_VERSION_CREATE_MODAL' });

export const createOpinionVersion = (dispatch: Dispatch, data: Object, opinionId: string) => {
  dispatch(startCreatingOpinionVersion());
  return Fetcher
    .post(`/opinions/${opinionId}/versions`, data)
    .then(
      (version) => {
        dispatch(closeOpinionVersionCreateModal());
        window.location.href = `${window.location.href}/versions/${version.slug}`;
      },
      () => {
        dispatch(cancelCreatingOpinionVersion());
      },
    );
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

export const fetchOpinionVotes = (opinionId: Uuid, versionId: ?Uuid): FetchOpinionVotesAction => ({
  type: OPINION_VOTES_FETCH_REQUESTED,
  opinionId,
  versionId,
});

export const versionVoteSuccess = (versionId: Uuid, vote: OpinionVote): Action => ({
  type: VERSION_VOTE_SUCCEEDED,
  versionId,
  vote,
});

export const opinionVoteSuccess = (opinionId: Uuid, vote: OpinionVote): Action => ({
  type: OPINION_VOTE_SUCCEEDED,
  opinionId,
  vote,
});

export const deleteOpinionVoteSuccess = (opinionId: Uuid, vote: OpinionVote): Action => ({
  type: DELETE_OPINION_VOTE_SUCCEEDED,
  opinionId,
  vote,
});

export const deleteVersionVoteSuccess = (versionId: Uuid, vote: OpinionVote): Action => ({
  type: DELETE_VERSION_VOTE_SUCCEEDED,
  versionId,
  vote,
});

const deleteVote = (opinion: Uuid, parent: ?Uuid, dispatch: Dispatch): void => {
  const url = parent ? `/opinions/${parent}/versions/${opinion}/votes` : `/opinions/${opinion}/votes`;
  Fetcher
    .delete(url)
    .then(json)
    .then((data) => {
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
    .catch((e) => {
      FluxDispatcher.dispatch({
        actionType: UPDATE_OPINION_FAILURE,
        message: 'opinion.request.failure',
      });
      console.error(e); // eslint-disable-line no-console
    });
};

const vote = (value: VoteValue, opinion: Uuid, parent: ?Uuid, dispatch: Dispatch): void => {
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
    .catch((e) => {
      FluxDispatcher.dispatch({
        actionType: UPDATE_OPINION_FAILURE,
        message: 'opinion.request.failure',
      });
      console.error(e); // eslint-disable-line no-console
    });
};

export const deleteVoteOpinion = (opinion: Uuid, dispatch: Dispatch): void => (
  deleteVote(opinion, null, dispatch))
;

export const deleteVoteVersion = (version: Uuid, opinion: Uuid, dispatch: Dispatch): void => (
  deleteVote(version, opinion, dispatch)
);

export const voteOpinion = (value: VoteValue, opinion: Uuid, dispatch: Dispatch): void => (
  vote(value, opinion, null, dispatch)
);

export const voteVersion = (value: VoteValue, version: Uuid, opinion: Uuid, dispatch: Dispatch): void => (
  vote(value, version, opinion, dispatch)
);

const updateOpinion = (state: State, opinion: Opinion): State => ({
  ...state,
  opinionsById: { ...state.opinionsById, [opinion.id]: opinion },
});

const updateVersion = (state: State, version: Version): State => ({
  ...state,
  versionsById: { ...state.versionsById, [version.id]: version },
});

const getVoteStringByValue = (value: VoteValue): string => {
  if (value === 1) return 'Ok';
  if (value === -1) return 'Nok';
  return 'Mitige';
};

const appendVote = (state: State, newVote: Object, object: Object, type: string): State => {
  const previousVote = object.votes.find(v => v.user.uniqueId === newVote.user.uniqueId);
  const voteCountIncreasing = `votesCount${getVoteStringByValue(newVote.value)}`;
  if (typeof previousVote === 'undefined') { // first vote
    const contribution = {
      ...object,
      votes: [...object.votes, newVote],
      userHasVote: true,
      [voteCountIncreasing]: object[voteCountIncreasing] + 1,
      votesCount: object.votesCount + 1,
      user_vote: newVote.value,
    };
    return type === 'version' ? updateVersion(state, contribution) : updateOpinion(state, contribution);
  }
  const indexOfCurrentUserVote = object.votes.findIndex(v => v.user.uniqueId === newVote.user.uniqueId);
  object.votes.splice(indexOfCurrentUserVote, 1);
  const voteCountDecreasing = `votesCount${getVoteStringByValue(previousVote.value)}`;
  const contribution = {
    ...object,
    votes: [...object.votes, newVote],
    [voteCountDecreasing]: object[voteCountDecreasing] - 1,
    [voteCountIncreasing]: object[voteCountIncreasing] + 1,
    user_vote: newVote.value,
  };
  return type === 'version' ? updateVersion(state, contribution) : updateOpinion(state, contribution);
};

const removeVote = (state: State, oldVote: Object, object: Object, type: string): State => {
  const indexToRemove = object.votes.findIndex(v => v.user && v.user.uniqueId === oldVote.user.uniqueId);
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
      console.log(OPINION_VOTES_FETCH_FAILED, action.error); // eslint-disable-line no-console
      return state;
    }
    default:
      return state;
  }
};
