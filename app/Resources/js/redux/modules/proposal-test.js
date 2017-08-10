/* eslint-env jest */
import { call, put } from 'redux-saga/effects';
import { reducer, deleteVoteSucceeded, fetchPosts } from './proposal';
import Fetcher from '../../services/Fetcher';

describe('Proposal Reducer', () => {
  it('Should handle POSTS_FETCH_SUCCEEDED', () => {
    const initialState = {
      proposalsById: {
        1: {},
      },
    };
    const posts = [{}, {}];
    const newState = reducer(initialState, {
      type: 'proposal/POSTS_FETCH_SUCCEEDED',
      proposalId: 1,
      posts,
    });
    expect(newState).toEqual({
      proposalsById: {
        1: {
          posts,
        },
      },
    });
  });

  it('Should handle deleteVoteSucceeded', () => {
    const initialState = {
      userVotesByStepId: { 6: [2, 3] },
      proposalsById: {},
    };
    const newState = reducer(initialState, deleteVoteSucceeded(6, 2, {}));
    expect(newState).toMatchSnapshot();
  });
});

describe('Proposal Sagas', () => {
  it('Should fetchPosts', () => {
    const generator = fetchPosts({
      proposalId: 1,
    });
    const posts = [];
    expect(generator.next().value).toEqual(
      call(Fetcher.get, '/proposals/1/posts'),
    );
    expect(generator.next({ posts }).value).toEqual(
      put({
        type: 'proposal/POSTS_FETCH_SUCCEEDED',
        proposalId: 1,
        posts,
      }),
    );

    expect(generator.throw({}).value).toEqual(
      put({ type: 'proposal/POSTS_FETCH_FAILED', error: {} }),
    );
  });
});
