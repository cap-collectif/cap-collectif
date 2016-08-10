/* eslint-env mocha */
import { expect } from 'chai';
import {
  reducer,
  fetchAllVotes,
  DELETE_VOTE_SUCCEEDED,
  VOTES_FETCH_SUCCEEDED,
  VOTES_FETCH_FAILED,
  VOTE_SUCCEEDED,
 } from './idea';
import { call, put } from 'redux-saga/effects';
import Fetcher from '../../services/Fetcher';

describe('Idea Reducer', () => {
  it('Should handle VOTES_FETCH_SUCCEEDED', () => {
    const initialState = {
      ideas: {
        1: { votes: [] },
      },
    };
    const votes = [
        { username: 'paul' },
        { username: 'popo' },
    ];
    const newState = reducer(initialState, {
      type: VOTES_FETCH_SUCCEEDED,
      ideaId: 1,
      votes,
    });
    expect(newState).to.eql({
      ideas: {
        1: {
          votes,
        },
      },
    });
  });
  it('Should handle VOTE_SUCCEEDED', () => {
    const initialState = {
      ideas: {
        1: { votesCount: 1, commentsCount: 1 },
      },
    };
    const newStateWithComment = reducer(initialState, {
      type: VOTE_SUCCEEDED,
      ideaId: 1,
      hasComment: true,
    });
    const newStateWithoutComment = reducer(initialState, {
      type: VOTE_SUCCEEDED,
      ideaId: 1,
      hasComment: false,
    });
    expect(newStateWithComment).to.eql({
      ideas: {
        1: {
          votesCount: 2,
          userHasVote: true,
          commentsCount: 2,
        },
      },
    });
    expect(newStateWithoutComment).to.eql({
      ideas: {
        1: {
          votesCount: 2,
          userHasVote: true,
          commentsCount: 1,
        },
      },
    });
  });
  it('Should handle DELETE_VOTE_SUCCEEDED', () => {
    const initialState = {
      ideas: {
        1: { votesCount: 1 },
      },
    };
    const newState = reducer(initialState, {
      type: DELETE_VOTE_SUCCEEDED,
      ideaId: 1,
    });
    expect(newState).to.eql({
      ideas: {
        1: {
          votesCount: 0,
          userHasVote: false,
        },
      },
    });
  });
});

describe('Idea Sagas', () => {
  it('Should fetchAllVotes', () => {
    const generator = fetchAllVotes({
      payload: {
        idea: {
          id: 1,
        },
      },
    });

    const votes = [];
    expect(generator.next().value).to.eql(call(Fetcher.get, '/ideas/1/votes?offset=0&limit=50'));
    expect(generator.next({
      hasMore: true,
      votes,
    }).value).to.eql(
      put({
        type: VOTES_FETCH_SUCCEEDED,
        ideaId: 1,
        votes,
      })
    );
    expect(generator.next().value).to.eql(call(Fetcher.get, '/ideas/1/votes?offset=50&limit=50'));

    expect(generator.throw().value).to.eql(put({ type: VOTES_FETCH_FAILED }));
  });
});
