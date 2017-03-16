// @flow
import { takeEvery } from 'redux-saga';
import { select, call, put } from 'redux-saga/effects';
import { stringify } from 'qs';
import Fetcher from '../../services/Fetcher';
import type { Exact, State as GlobalState, Uuid, Action } from '../../types';

export type State = {
  currentProjectStepById: ?number,
  currentProjectById: ?Uuid,
  projects: Array<Object>,
  projectsById: {[id: Uuid]: Object},
  projectTypes: Array<Object>,
  page: number,
  pages: ?Array<Object>,
  limit: ?number,
  orderBy: ?string,
  type: ?string,
  filters: Object,
  term: ?string,
  theme: ?string,
  isLoading: boolean,
  count: number
};

const initialState : State = {
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
type RequestLoadStepsAction = { type: 'project/STEPS_FETCH_REQUESTED', projectId: string };
type RequestFetchProjectsAction = { type: 'project/PROJECTS_FETCH_REQUESTED' };
type ChangePageAction = { type: 'project/CHANGE_PAGE', page: number };
type ChangeOrderByAction = { type: 'project/CHANGE_ORDER_BY', orderBy: ?string };
type ChangeProjectTypeAction = { type: 'project/CHANGE_TYPE', projectType: ?string };
type ChangeProjectTermAction = { type: 'project/CHANGE_TERM', term: ?string };
type ChangeProjectThemeAction = { type: 'project/CHANGE_THEME', theme: ?string };
type ReceivedStepsSucceedAction = { type: 'project/STEPS_FETCH_SUCCEEDED', steps: Array<Object>, projectId: string };
type ReceivedProjectSucceedAction = { type: 'project/PROJECTS_FETCH_SUCCEEDED', project: Object };

export type ProjectAction =
    RequestLoadStepsAction
  | RequestFetchProjectsAction
  | ChangePageAction
  | ChangeOrderByAction
  | ChangeProjectTypeAction
  | ChangeProjectTermAction
  | ChangeProjectThemeAction
  | ReceivedStepsSucceedAction
  | ReceivedProjectSucceedAction
;

export const loadSteps = (projectId: Uuid): RequestLoadStepsAction => ({ type: 'project/STEPS_FETCH_REQUESTED', projectId });
export const fetchProjects = (): RequestFetchProjectsAction => ({ type: 'project/PROJECTS_FETCH_REQUESTED' });
export const changePage = (page: number): ChangePageAction => ({ type: 'project/CHANGE_PAGE', page });
export const changeOrderBy = (orderBy: ?string): ChangeOrderByAction => ({ type: 'project/CHANGE_ORDER_BY', orderBy });
export const changeType = (projectType: ?string): ChangeProjectTypeAction => ({ type: 'project/CHANGE_TYPE', projectType });
export const changeTerm = (term: ?string): ChangeProjectTermAction => ({ type: 'project/CHANGE_TERM', term });
export const changeTheme = (theme: ?string): ChangeProjectThemeAction => ({ type: 'project/CHANGE_THEME', theme });

export function* fetchStepsSaga(action: RequestLoadStepsAction): Generator<*, *, *> {
  try {
    const result: Array<Object> = yield call(Fetcher.get, `/projects/${action.projectId}/steps`);
    const receivedAction : ReceivedStepsSucceedAction = { type: 'project/STEPS_FETCH_SUCCEEDED', steps: result, projectId: action.projectId };
    yield put(receivedAction);
  } catch (e) {
    console.log(e); // eslint-disable-line
  }
}

export function* fetchProjectsSaga(): Generator<*, *, *> {
  try {
    const globalState: GlobalState = yield select();
    const state = globalState.project;
    const queryStrings = {
      orderBy: state.orderBy || undefined,
      type: state.type || undefined,
      term: state.term || undefined,
      theme: state.theme || undefined,
      page: state.page || undefined,
    };
    const result: Object = yield call(Fetcher.get, `/projects?${stringify(queryStrings)}`);
    const succeedAction: ReceivedProjectSucceedAction = { type: 'project/PROJECTS_FETCH_SUCCEEDED', project: result };
    yield put(succeedAction);
  } catch (e) {
    yield put({ type: 'project/PROJECTS_FETCH_FAILED', error: e });
  }
}

export function* saga(): Generator<*, *, *> {
  yield [
    takeEvery('project/PROJECTS_FETCH_REQUESTED', fetchProjectsSaga),
    takeEvery('project/STEPS_FETCH_REQUESTED', fetchStepsSaga),
  ];
}

export const reducer = (state: State = initialState, action: Action): Exact<State> => {
  switch (action.type) {
    case '@@INIT':
      return { ...initialState, ...state };
    case 'project/PROJECTS_FETCH_REQUESTED':
      return { ...state, isLoading: true };
    case 'project/PROJECTS_FETCH_SUCCEEDED':
      return { ...state, ...action.project, isLoading: false };
    case 'project/STEPS_FETCH_SUCCEEDED': {
      const projectsById = state.projectsById;
      projectsById[action.projectId].steps = action.steps;
      return { ...state, projectsById };
    }
    case 'project/PROJECTS_FETCH_FAILED':
      return { ...state, isLoading: false };
    case 'project/CHANGE_FILTER': {
      const filters = { ...state.filters, [action.filter]: action.value };
      return { ...state, filters };
    }
    case 'project/CHANGE_ORDER_BY':
      return { ...state, orderBy: action.orderBy };
    case 'project/CHANGE_TERM':
      return { ...state, term: action.term };
    case 'project/CHANGE_TYPE':
      return { ...state, type: action.projectType };
    case 'project/CHANGE_THEME':
      return { ...state, theme: action.theme };
    case 'project/CHANGE_PAGE':
      return { ...state, page: action.page };
    default:
      return state;
  }
};
