/* eslint-env jest */
import { call, put } from 'redux-saga/effects';
import { reducer, fetchAllVotes } from './idea';
import Fetcher from '../../services/Fetcher';

describe('Idea Reducer', () => {
  it('Should handle VOTES_FETCH_SUCCEEDED', () => {
    const initialState = {
      ideas: {
        1: { votes: [] },
      },
    };
    const votes = [{ username: 'paul' }, { username: 'popo' }];
    const newState = reducer(initialState, {
      type: 'idea/VOTES_FETCH_SUCCEEDED',
      ideaId: 1,
      votes,
    });
    expect(newState).toEqual({
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
        1: { votesCount: 1, votes: [{ id: 1 }] },
      },
    };
    const newState = reducer(initialState, {
      type: 'idea/VOTE_SUCCEEDED',
      ideaId: 1,
      vote: { id: 2 },
    });
    expect(newState).toEqual({
      ideas: {
        1: {
          votesCount: 2,
          userHasVote: true,
          votes: [{ id: 2 }, { id: 1 }],
        },
      },
    });
  });
  it('Should handle DELETE_VOTE_SUCCEEDED', () => {
    const initialState = {
      ideas: {
        1: {
          votesCount: 2,
          votes: [{ user: { unidId: 'user' }, private: false }, { private: true }],
        },
      },
    };
    let newState = reducer(initialState, {
      type: 'idea/DELETE_VOTE_SUCCEEDED',
      ideaId: 1,
      vote: { user: { unidId: 'user' } },
    });
    expect(newState).toEqual({
      ideas: {
        1: {
          votesCount: 1,
          userHasVote: false,
          votes: [{ private: true }],
        },
      },
    });
    newState = reducer(initialState, {
      type: 'idea/DELETE_VOTE_SUCCEEDED',
      ideaId: 1,
      vote: { private: true },
    });
    expect(newState).toEqual({
      ideas: {
        1: {
          votesCount: 1,
          userHasVote: false,
          votes: [{ user: { unidId: 'user' }, private: false }],
        },
      },
    });
  });
});

describe('Idea Sagas', () => {
  it('Should fetchAllVotes', () => {
    const generator = fetchAllVotes({
      ideaId: 1,
    });

    const votes = [];
    expect(generator.next().value).toEqual(call(Fetcher.get, '/ideas/1/votes?offset=0&limit=50'));
    expect(
      generator.next({
        hasMore: true,
        votes,
      }).value,
    ).toEqual(
      put({
        type: 'idea/VOTES_FETCH_SUCCEEDED',
        ideaId: 1,
        votes,
      }),
    );
    expect(generator.next().value).toEqual(call(Fetcher.get, '/ideas/1/votes?offset=50&limit=50'));

    expect(generator.throw({}).value).toEqual(put({ type: 'idea/VOTES_FETCH_FAILED', error: {} }));
  });
});
