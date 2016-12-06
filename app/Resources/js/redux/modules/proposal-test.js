/* eslint-env jest */
import { expect } from 'chai';
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
    expect(newState).to.eql({
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
    expect(generator.next().value).to.eql(call(Fetcher.get, '/proposals/1/posts'));
    expect(generator.next({ posts }).value).to.eql(
      put({
        type: POSTS_FETCH_SUCCEEDED,
        proposalId: 1,
        posts,
      })
    );

    expect(generator.throw({}).value).to.eql(put({ type: POSTS_FETCH_FAILED, error: {} }));
  });
});
