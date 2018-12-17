/* eslint-env jest */

import { reducer } from './report';

describe('Report Reducer', () => {
  it('Should handle OPEN_MODAL', () => {
    const initialState = { currentReportingModal: null };
    const newState = reducer(initialState, { type: 'report/OPEN_MODAL', id: 1 });
    expect(newState).toEqual({ currentReportingModal: 1 });
  });

  it('Should handle CLOSE_MODAL', () => {
    const initialState = { currentReportingModal: 'lalaa' };
    const newState = reducer(initialState, { type: 'report/CLOSE_MODAL' });
    expect(newState).toEqual({ currentReportingModal: null });
  });

  it('Should handle START_LOADING', () => {
    const initialState = { isLoading: false };
    const newState = reducer(initialState, { type: 'report/START_LOADING' });
    expect(newState).toEqual({ isLoading: true });
  });

  it('Should handle STOP_LOADING', () => {
    const initialState = { isLoading: true };
    const newState = reducer(initialState, { type: 'report/STOP_LOADING' });
    expect(newState).toEqual({ isLoading: false });
  });

  it('Should handle ADD_REPORTED', () => {
    const initialState = { currentReportingModal: 'foo', elements: ['bar'] };
    const newState = reducer(initialState, { type: 'report/ADD_REPORTED' });
    expect(newState).toEqual({ currentReportingModal: 'foo', elements: ['bar', 'foo'] });
  });
});
