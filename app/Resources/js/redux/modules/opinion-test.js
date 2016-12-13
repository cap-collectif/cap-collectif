/* eslint-env jest */
import {
  reducer,
  opinionVoteSuccess,
  deleteOpinionVoteSuccess,
  versionVoteSuccess,
  deleteVersionVoteSuccess,
} from './opinion';
// import { call, put } from 'redux-saga/effects';
// import Fetcher from '../../services/Fetcher';

describe('Opinion Reducers', () => {
  const vote = {
    value: 1,
    user: { uniqueId: 'admin' },
  };
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

// describe('Opinion Sagas', () => {
  // it('Should fetchPosts', () => {
  //   const generator = fetchPosts({
  //     proposalId: 1,
  //   });
  //   const posts = [];
  //   expect(generator.next().value).to.eql(call(Fetcher.get, '/proposals/1/posts'));
  //   expect(generator.next({ posts }).value).to.eql(
  //     put({
  //       type: POSTS_FETCH_SUCCEEDED,
  //       proposalId: 1,
  //       posts,
  //     })
  //   );
  //
  //   expect(generator.throw({}).value).to.eql(put({ type: POSTS_FETCH_FAILED, error: {} }));
  // });
// });
