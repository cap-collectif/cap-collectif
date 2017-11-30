/* eslint-env jest */
import { call, put } from 'redux-saga/effects';
import {
  reducer,
  opinionVoteSuccess,
  deleteOpinionVoteSuccess,
  versionVoteSuccess,
  deleteVersionVoteSuccess,
  fetchAllOpinionVotes,
  fetchOpinionVotes,
  OPINION_VOTES_FETCH_FAILED,
  OPINION_VOTES_FETCH_SUCCEEDED,
} from './opinion';
import Fetcher from '../../services/Fetcher';

const vote = {
  value: 1,
  user: { uniqueId: 'admin' },
};

describe('Opinion Reducers', () => {
  it('Should handle opinionVoteSuccess and deleteOpinionVoteSuccess', () => {
    const initialState = {
      opinionsById: {
        1: {
          id: 1,
          votes: [],
          votesCount: 0,
          votesCountOk: 0,
          votesCountNok: 0,
          votesCountMitige: 0,
          user_vote: null,
          userHasVote: false,
        },
      },
    };
    const newState = reducer(initialState, opinionVoteSuccess(1, vote));
    expect(newState).toMatchSnapshot();
    const secondState = reducer(newState, deleteOpinionVoteSuccess(1, vote));
    expect(secondState).toEqual(initialState);
  });
  it('Should handle versionVoteSuccess and deleteVersionVoteSuccess', () => {
    const initialState = {
      versionsById: {
        1: {
          id: 1,
          votes: [],
          votesCount: 0,
          votesCountOk: 0,
          votesCountNok: 0,
          votesCountMitige: 0,
          user_vote: null,
          userHasVote: false,
        },
      },
    };
    const newState = reducer(initialState, versionVoteSuccess(1, vote));
    expect(newState).toMatchSnapshot();
    const secondState = reducer(newState, deleteVersionVoteSuccess(1, vote));
    expect(secondState).toEqual(initialState);
  });
});

describe('Opinion Sagas', () => {
  it('Should fetchPosts', () => {
    const votes = [vote];
    const error = {};
    const dispatchSuccess = put({ type: OPINION_VOTES_FETCH_SUCCEEDED, votes, opinionId: 1 });
    const dispatchFailure = put({ type: OPINION_VOTES_FETCH_FAILED, error });
    const gen = fetchAllOpinionVotes(fetchOpinionVotes(1));
    expect(gen.next().value).toEqual(call(Fetcher.get, '/opinions/1/votes?offset=0&limit=30'));
    expect(gen.next({ votes, hasMore: false }).value).toEqual(dispatchSuccess);
    expect(gen.throw(error).value).toEqual(dispatchFailure);
  });
});
