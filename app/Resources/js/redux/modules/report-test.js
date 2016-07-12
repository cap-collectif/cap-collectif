/* eslint-env mocha */
import { expect } from 'chai';
import { reducer } from './report';
import { OPEN_MODAL, CLOSE_MODAL, START_LOADING, STOP_LOADING } from './report';

describe('Report Reducer', () => {
  it('Should handle OPEN_MODAL', () => {
    const initialState = { showModal: false };
    const newState = reducer(initialState, { type: OPEN_MODAL });
    expect(newState).to.eql({ showModal: true });
  });

  it('Should handle CLOSE_MODAL', () => {
    const initialState = { showModal: true };
    const newState = reducer(initialState, { type: CLOSE_MODAL });
    expect(newState).to.eql({ showModal: false });
  });

  it('Should handle START_LOADING', () => {
    const initialState = { isLoading: false };
    const newState = reducer(initialState, { type: START_LOADING });
    expect(newState).to.eql({ isLoading: true });
  });

  it('Should handle STOP_LOADING', () => {
    const initialState = { isLoading: true };
    const newState = reducer(initialState, { type: STOP_LOADING });
    expect(newState).to.eql({ isLoading: false });
  });
});
