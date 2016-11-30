import { takeEvery } from 'redux-saga';
import { select, call, put } from 'redux-saga/effects';
import Fetcher from '../../services/Fetcher';
import { stringify } from 'qs';

export const STEPS_FETCH_REQUESTED = 'project/STEPS_FETCH_REQUESTED';
export const PROJECTS_FETCH_REQUESTED = 'project/PROJECTS_FETCH_REQUESTED';
export const PROJECTS_FETCH_SUCCEEDED = 'project/PROJECTS_FETCH_SUCCEEDED';
export const PROJECTS_FETCH_FAILED = 'project/PROJECTS_FETCH_FAILED';
export const CHANGE_PAGE = 'project/CHANGE_PAGE';
export const CHANGE_ORDER_BY = 'project/CHANGE_ORDER_BY';
export const CHANGE_TYPE = 'project/CHANGE_TYPE';
export const CHANGE_THEME = 'project/CHANGE_THEME';
export const CHANGE_TERM = 'project/CHANGE_TERM';
export const CHANGE_FILTER = 'project/CHANGE_FILTER';
export const STEPS_FETCH_SUCCEEDED = 'project/STEPS_FETCH_SUCCEEDED';

const initialState = {
  currentProjectStepById: null,
  currentProjectById: null,
  projects: [],
  projectsById: {},
  projectTypes: [],
  page: 1,
  pages: null,
  limit: null,
  orderBy: null,
  type: null,
  filters: {},
  term: null,
  theme: null,
  isLoading: true,
  count: 0,
};

export const loadSteps = projectId => ({ type: STEPS_FETCH_REQUESTED, projectId });
export const fetchProjects = () => ({ type: PROJECTS_FETCH_REQUESTED });
export const changePage = (page) => ({ type: CHANGE_PAGE, page });
export const changeOrderBy = (orderBy) => ({ type: CHANGE_ORDER_BY, orderBy });
export const changeType = (projectType) => ({ type: CHANGE_TYPE, projectType });
export const changeTerm = (term) => ({ type: CHANGE_TERM, term });
export const changeTheme = (theme) => ({ type: CHANGE_THEME, theme });

export function* fetchStepsSaga(action) {
  try {
    const result = yield call(Fetcher.get, `/projects/${action.projectId}/steps`);
    yield put({ type: STEPS_FETCH_SUCCEEDED, steps: result, projectId: action.projectId });
  } catch (e) {
    console.log(e); // eslint-disable-line
  }
}

export function* fetchProjectsSaga() {
  try {
    const globalState = yield select();
    const state = globalState.project;
    const queryStrings = {
      orderBy: state.orderBy || undefined,
      type: state.type || undefined,
      term: state.term || undefined,
      theme: state.theme || undefined,
      page: state.page || undefined,
    };
    const url = `/projects?${stringify(queryStrings)}`;
    const result = yield call(Fetcher.get, url);
    yield put({ type: PROJECTS_FETCH_SUCCEEDED, project: result });
  } catch (e) {
    yield put({ type: PROJECTS_FETCH_FAILED, error: e });
  }
}

export function* saga() {
  yield [
    takeEvery(PROJECTS_FETCH_REQUESTED, fetchProjectsSaga),
    takeEvery(STEPS_FETCH_REQUESTED, fetchStepsSaga),
  ];
}

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case '@@INIT':
      return { ...initialState, ...state };
    case PROJECTS_FETCH_REQUESTED:
      return { ...state, isLoading: true };
    case PROJECTS_FETCH_SUCCEEDED:
      return { ...state, ...action.project, isLoading: false };
    case STEPS_FETCH_SUCCEEDED: {
      const projectsById = state.projectsById;
      projectsById[action.projectId].steps = action.steps;
      return { ...state, projectsById };
    }
    case PROJECTS_FETCH_FAILED:
      return { ...state, isLoading: false };
    case CHANGE_FILTER: {
      const filters = { ...state.filters, [action.filter]: action.value };
      return { ...state, filters };
    }
    case CHANGE_ORDER_BY:
      return { ...state, orderBy: action.orderBy };
    case CHANGE_TERM:
      return { ...state, term: action.term };
    case CHANGE_TYPE:
      return { ...state, type: action.projectType };
    case CHANGE_THEME:
      return { ...state, theme: action.theme };
    case CHANGE_PAGE:
      return { ...state, page: action.page };
    default:
      return state;
  }
};
