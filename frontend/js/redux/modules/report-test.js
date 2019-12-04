// @flow
/* eslint-env jest */

import { reducer } from './report';

const defaultInitialState = { currentReportingModal: null, isLoading: false, elements: [] };

describe('Report Reducer', () => {
  it('Should handle OPEN_MODAL', () => {
    const newState = reducer(defaultInitialState, { type: 'report/OPEN_MODAL', id: 1 });
    expect(newState).toMatchSnapshot();
  });

  it('Should handle CLOSE_MODAL', () => {
    const initialState = { ...defaultInitialState, currentReportingModal: 'lalaa' };
    const newState = reducer(initialState, { type: 'report/CLOSE_MODAL' });
    expect(newState).toMatchSnapshot();
  });

  it('Should handle START_LOADING', () => {
    const newState = reducer(defaultInitialState, { type: 'report/START_LOADING' });
    expect(newState).toMatchSnapshot();
  });

  it('Should handle STOP_LOADING', () => {
    const initialState = { ...defaultInitialState, isLoading: true };
    const newState = reducer(initialState, { type: 'report/STOP_LOADING' });
    expect(newState).toMatchSnapshot();
  });

  it('Should handle ADD_REPORTED', () => {
    const initialState = {
      ...defaultInitialState,
      currentReportingModal: 'foo',
      elements: ['bar'],
    };
    const newState = reducer(initialState, { type: 'report/ADD_REPORTED' });
    expect(newState).toMatchSnapshot();
  });
});
