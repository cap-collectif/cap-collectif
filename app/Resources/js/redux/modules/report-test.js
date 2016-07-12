/* eslint-env mocha */
import { expect } from 'chai';
import { reducer } from './report';
import { OPEN_MODAL, CLOSE_MODAL, START_LOADING, STOP_LOADING, ADD_REPORTED } from './report';

describe('Report Reducer', () => {
  it('Should handle OPEN_MODAL', () => {
    const initialState = { currentReportingModal: null };
    const newState = reducer(initialState, { type: OPEN_MODAL, payload: { id: 'lola' } });
    expect(newState).to.eql({ currentReportingModal: 'lola' });
  });

  it('Should handle CLOSE_MODAL', () => {
    const initialState = { currentReportingModal: 'lalaa' };
    const newState = reducer(initialState, { type: CLOSE_MODAL });
    expect(newState).to.eql({ currentReportingModal: null });
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

  it('Should handle ADD_REPORTED', () => {
    const initialState = { currentReportingModal: 'foo', elements: ['bar'] };
    const newState = reducer(initialState, { type: ADD_REPORTED });
    expect(newState).to.eql({ currentReportingModal: 'foo', elements: ['bar', 'foo'] });
  });
});
