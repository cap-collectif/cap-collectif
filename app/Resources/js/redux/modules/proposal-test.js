/* eslint-env jest */

import {
  reducer,
  fetchPosts,
  POSTS_FETCH_SUCCEEDED,
  POSTS_FETCH_FAILED,
} from './proposal';
import { call, put } from 'redux-saga/effects';
import Fetcher from '../../services/Fetcher';

describe('Proposal Reducer', () => {
  it('Should handle POSTS_FETCH_SUCCEEDED', () => {
    const initialState = {
      proposalsById: {
        1: { },
      },
    };
    const posts = [
        { },
        { },
    ];
    const newState = reducer(initialState, {
      type: POSTS_FETCH_SUCCEEDED,
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
});

describe('Proposal Sagas', () => {
  it('Should fetchPosts', () => {
    const generator = fetchPosts({
      proposalId: 1,
    });
    const posts = [];
    expect(generator.next().value).toEqual(call(Fetcher.get, '/proposals/1/posts'));
    expect(generator.next({ posts }).value).toEqual(
      put({
        type: POSTS_FETCH_SUCCEEDED,
        proposalId: 1,
        posts,
      })
    );

    expect(generator.throw({}).value).toEqual(put({ type: POSTS_FETCH_FAILED, error: {} }));
  });
});
