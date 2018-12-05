/* eslint-env jest */
import { put, select, call } from 'redux-saga/effects';
import { reducer, fetchProjectsSaga } from './project';
import Fetcher from '../../services/Fetcher';

describe('Project Reducer', () => {
  it('Should handle PROJECTS_FETCH_SUCCEEDED', () => {
    const initialState = {
      isLoading: false,
      visibleProjects: [],
    };
    const result = {
      projects: [{ id: '1' }, { id: '2' }],
      count: 2,
      page: 1,
      pages: 1,
    };
    const newState = reducer(initialState, {
      type: 'project/PROJECTS_FETCH_SUCCEEDED',
      project: result,
    });
    expect(newState).toEqual({
      isLoading: false,
      count: 2,
      page: 1,
      pages: 1,
      visibleProjects: ['1', '2'],
    });
  });
});

describe('Project Sagas', () => {
  it('Should fetchProjects', () => {
    const generator = fetchProjectsSaga();
    const project = {
      project: {
        projects: [],
      },
    };
    expect(generator.next().value).toEqual(select());
    expect(generator.next(project).value).toEqual(call(Fetcher.get, '/projects?'));
    expect(generator.next(project).value).toEqual(
      put({
        type: 'project/PROJECTS_FETCH_SUCCEEDED',
        project,
      }),
    );

    expect(generator.throw({}).value).toEqual(
      put({ type: 'project/PROJECTS_FETCH_FAILED', error: {} }),
    );
  });
});
