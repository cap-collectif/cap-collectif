/* eslint-env mocha */
import { expect } from 'chai';
import {
  reducer,
  fetchProjectsSaga,
  PROJECTS_FETCH_SUCCEEDED,
  PROJECTS_FETCH_FAILED,
} from './project';
import { put, select, call } from 'redux-saga/effects';
import Fetcher from '../../services/Fetcher';

describe('Project Reducer', () => {
  it('Should handle PROJECTS_FETCH_SUCCEEDED', () => {
    const initialState = {
      isLoading: false,
      projects: [],
    };
    const result = {
      projects: [
        {},
        {},
      ],
    };
    const newState = reducer(initialState, {
      type: PROJECTS_FETCH_SUCCEEDED,
      project: result,
    });
    expect(newState).to.eql({
      isLoading: false,
      projects: result.projects,
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
    expect(generator.next().value).to.eql(select());
    expect(generator.next(project).value).to.eql(call(Fetcher.get, '/projects?'));
    expect(generator.next(project).value).to.eql(
      put({
        type: PROJECTS_FETCH_SUCCEEDED,
        project,
      })
    );

    expect(generator.throw({}).value).to.eql(put({ type: PROJECTS_FETCH_FAILED, error: {} }));
  });
});
