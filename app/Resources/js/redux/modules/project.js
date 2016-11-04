import { takeEvery } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import Fetcher from '../../services/Fetcher';

const PROJECTS_FETCH_REQUESTED = 'project/PROJECTS_FETCH_REQUESTED';
const PROJECTS_FETCH_SUCCEEDED = 'project/PROJECTS_FETCH_SUCCEEDED';
const PROJECTS_FETCH_FAILED = 'project/PROJECTS_FETCH_FAILED';

const initialState = {
  currentProjectStepById: null,
  currentProjectById: null,
  projects: [],
};

export const fetchProjects = () => ({ type: PROJECTS_FETCH_REQUESTED });

export function* fetchProjectsSaga() {
  try {
    const result = yield call(Fetcher.get, '/projects');
    yield put({ type: PROJECTS_FETCH_SUCCEEDED, projects: result });
  } catch (e) {
    console.log(e);
    yield put({ type: PROJECTS_FETCH_FAILED, error: e });
  }
}

export function* saga() {
  yield* takeEvery(PROJECTS_FETCH_REQUESTED, fetchProjectsSaga);
}

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case PROJECTS_FETCH_SUCCEEDED:
      return { ...state, projects: action.projects };
    default:
      return state;
  }
};
