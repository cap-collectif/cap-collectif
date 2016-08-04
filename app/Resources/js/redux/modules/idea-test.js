/* eslint-env mocha */
import { expect } from 'chai';
import { reducer, VOTES_FETCH_SUCCEEDED } from './idea';

describe('Idea Reducer', () => {
  it('Should handle VOTES_FETCH_SUCCEEDED', () => {
    const initialState = {
      ideas: {
        1: { votes: [] },
      },
    };
    const newState = reducer(initialState, {
      type: VOTES_FETCH_SUCCEEDED,
      ideaId: 1,
      votes: [
          { username: 'paul' },
          { username: 'popo' },
      ],
    });
    expect(newState).to.eql({
      ideas: {
        1: {
          votes: [
            { username: 'paul' },
            { username: 'popo' },
          ],
        },
      },
    });
  });
});
