// @flow
import { takeEvery, call, put } from 'redux-saga/effects';
import type { IOEffect } from 'redux-saga/effects';
import { find, findLast } from 'lodash';
import Fetcher from '../../services/Fetcher';
import type { Exact, Action } from '../../types';

export const VOTES_PREVIEW_COUNT = 8;

type Vote = {
  private: boolean,
  user: ?{
    uniqId: string,
  },
};

type Idea = {
  id: number,
  votesCount: number,
  votes: Array<Vote>,
};

type IdeaMap = { [id: number]: Idea };

type RequestVotesFetchAction = {
  type: 'idea/VOTES_FETCH_REQUESTED',
  ideaId: number,
};
type ReceivedVotesFetchSuccededAction = {
  type: 'idea/VOTES_FETCH_SUCCEEDED',
  votes: Array<Vote>,
  ideaId: number,
};
type ReceivedVotesFetchFailedAction = {
  type: 'idea/VOTES_FETCH_FAILED',
  error: string,
};
type VoteSucceedAction = {
  type: 'idea/VOTE_SUCCEEDED',
  ideaId: number,
  vote: Vote,
};
type DeleteVoteSucceedAction = {
  type: 'idea/DELETE_VOTE_SUCCEEDED',
  ideaId: number,
  vote: Vote,
};
type ShowIdeaCreateModalAction = { type: 'idea/SHOW_CREATE_MODAL' };
type HideIdeaCreateModalAction = { type: 'idea/HIDE_CREATE_MODAL' };
type ShowIdeaEditModalAction = { type: 'idea/SHOW_EDIT_MODAL', id: number };
type HideIdeaEditModalAction = { type: 'idea/HIDE_EDIT_MODAL' };

export type IdeaAction =
  | RequestVotesFetchAction
  | ReceivedVotesFetchSuccededAction
  | ReceivedVotesFetchFailedAction
  | VoteSucceedAction
  | DeleteVoteSucceedAction
  | ShowIdeaCreateModalAction
  | HideIdeaCreateModalAction
  | ShowIdeaEditModalAction
  | HideIdeaEditModalAction;

export type State = {
  +currentIdeaById: ?number,
  +ideas: IdeaMap,
  showCreateModal: boolean,
  showEditModal: ?number,
};

const initialState: State = {
  currentIdeaById: null,
  ideas: {},
  showCreateModal: false,
  showEditModal: null,
};

export const showIdeaCreateModal = (): ShowIdeaCreateModalAction => ({
  type: 'idea/SHOW_CREATE_MODAL',
});
export const hideIdeaCreateModal = (): HideIdeaCreateModalAction => ({
  type: 'idea/HIDE_CREATE_MODAL',
});
export const showIdeaEditModal = (id: number): ShowIdeaEditModalAction => ({
  type: 'idea/SHOW_EDIT_MODAL',
  id,
});
export const hideIdeaEditModal = (): HideIdeaEditModalAction => ({
  type: 'idea/HIDE_EDIT_MODAL',
});

export const deleteVoteSucceeded = (
  ideaId: number,
  vote: Vote,
): DeleteVoteSucceedAction => ({
  type: 'idea/DELETE_VOTE_SUCCEEDED',
  ideaId,
  vote,
});

export const fetchIdeaVotes = (ideaId: number): RequestVotesFetchAction => ({
  type: 'idea/VOTES_FETCH_REQUESTED',
  ideaId,
});

export const voteSuccess = (ideaId: number, vote: Vote): VoteSucceedAction => ({
  type: 'idea/VOTE_SUCCEEDED',
  ideaId,
  vote,
});

export function* fetchAllVotes(
  action: RequestVotesFetchAction,
): Generator<IOEffect, *, *> {
  try {
    let hasMore = true;
    let iterationCount = 0;
    const votesPerIteration = 50;
    while (hasMore) {
      const result = yield call(
        Fetcher.get,
        `/ideas/${action.ideaId}/votes?offset=${iterationCount *
          votesPerIteration}&limit=${votesPerIteration}`,
      );
      hasMore = result.hasMore;
      iterationCount++;
      const succeededAction: ReceivedVotesFetchSuccededAction = {
        type: 'idea/VOTES_FETCH_SUCCEEDED',
        votes: result.votes,
        ideaId: action.ideaId,
      };
      yield put(succeededAction);
    }
  } catch (e) {
    const failedAction: ReceivedVotesFetchFailedAction = {
      type: 'idea/VOTES_FETCH_FAILED',
      error: e,
    };
    yield put(failedAction);
  }
}

export function* saga(): Generator<IOEffect, *, *> {
  yield* takeEvery('idea/VOTES_FETCH_REQUESTED', fetchAllVotes);
}

export const reducer = (
  state: State = initialState,
  action: Action,
): Exact<State> => {
  switch (action.type) {
    case 'idea/SHOW_CREATE_MODAL': {
      return { ...state, showCreateModal: true };
    }
    case 'idea/HIDE_CREATE_MODAL': {
      return { ...state, showCreateModal: false };
    }
    case 'idea/SHOW_EDIT_MODAL': {
      return { ...state, showEditModal: action.id };
    }
    case 'idea/HIDE_EDIT_MODAL': {
      return { ...state, showEditModal: null };
    }
    case 'idea/VOTES_FETCH_SUCCEEDED': {
      let votes = state.ideas[action.ideaId].votes;
      if (votes.length <= VOTES_PREVIEW_COUNT) {
        votes = []; // we remove preview votes
      }
      for (const vote of action.votes) {
        votes.push(vote);
      }
      const ideas = {
        [action.ideaId]: { ...state.ideas[action.ideaId], votes },
      };
      return { ...state, ideas };
    }
    case 'idea/VOTE_SUCCEEDED': {
      const idea = state.ideas[action.ideaId];
      const ideas = {
        [action.ideaId]: {
          ...idea,
          ...{
            votes: [action.vote, ...idea.votes],
            userHasVote: true,
            votesCount: idea.votesCount + 1,
          },
        },
      };
      return { ...state, ideas };
    }
    case 'idea/DELETE_VOTE_SUCCEEDED': {
      const idea = state.ideas[action.ideaId];
      let index = 0;
      const actionVote = action.vote;
      if (actionVote.private) {
        const vote = findLast(idea.votes, v => v.private);
        if (vote) {
          index = idea.votes.indexOf(vote);
        }
      } else if (actionVote.user != null) {
        const user = actionVote.user;
        const vote = find(
          idea.votes,
          v => v.user && v.user.uniqId === user.uniqId,
        );
        if (vote) {
          index = idea.votes.indexOf(vote);
        }
      }
      const ideas = {
        [action.ideaId]: {
          ...idea,
          ...{
            votes: [
              ...idea.votes.slice(0, index),
              ...idea.votes.slice(index + 1),
            ],
            userHasVote: false,
            votesCount: idea.votesCount - 1,
          },
        },
      };
      return { ...state, ideas };
    }
    case 'idea/VOTES_FETCH_FAILED': {
      console.log('VOTES_FETCH_FAILED', action.error); // eslint-disable-line no-console
      return state;
    }
    default:
      return state;
  }
};
