// @flow
import LocalStorageService from '../../services/LocalStorageService';
import type { Exact, Uuid, Action } from '../../types';

export type State = {
  +currentProjectStepById: ?Uuid,
  +currentProjectById: ?Uuid,
  +visibleProjects: Array<Uuid>,
  +showConsultationPlanById: { [id: Uuid]: boolean },
  +projectsById: { [id: Uuid]: Object },
  +projectTypes: Array<Object>,
  +page: number,
  +pages: ?Array<Object>,
  +limit: ?number,
  +orderBy: string,
  +type: ?string,
  +filters: Object,
  +term: ?string,
  +theme: ?string,
  +isLoading: boolean,
  +count: number,
  +selectedActiveItems: Array<string>,
};

const initialState: State = {
  currentProjectStepById: null,
  currentProjectById: null,
  showConsultationPlanById: {},
  visibleProjects: [],
  projectsById: {},
  projectTypes: [],
  page: 1,
  pages: null,
  limit: null,
  orderBy: 'LATEST',
  type: null,
  filters: {},
  term: null,
  theme: null,
  isLoading: true,
  count: 0,
  selectedActiveItems: [],
};
type ChangeOrderByAction = {
  type: 'project/CHANGE_ORDER_BY',
  orderBy: string,
};
type ChangeProjectTypeAction = {
  type: 'project/CHANGE_TYPE',
  projectType: ?string,
};
type ChangeProjectTermAction = { type: 'project/CHANGE_TERM', term: ?string };
type ChangeProjectThemeAction = {
  type: 'project/CHANGE_THEME',
  theme: ?string,
};
type CloseConsultationPlanAction = {
  type: 'project/CLOSE_CONSULTATION_PLAN',
  id: string,
};
type OpenConsultationPlanAction = {
  type: 'project/OPEN_CONSULTATION_PLAN',
  id: string,
};
type ChangeConsultationPlanActiveItemsAction = {
  type: 'proposal/CHANGE_CONSULTATION_PLAN_ACTIVE_ITEMS',
  items: Array<string>,
};

export type ProjectAction =
  | ChangeOrderByAction
  | ChangeProjectTypeAction
  | ChangeProjectTermAction
  | ChangeProjectThemeAction
  | CloseConsultationPlanAction
  | OpenConsultationPlanAction
  | ChangeConsultationPlanActiveItemsAction
  | { type: 'project/CHANGE_FILTER', filter: string, value: string };

export const changeOrderBy = (orderBy: string): ChangeOrderByAction => ({
  type: 'project/CHANGE_ORDER_BY',
  orderBy,
});
export const changeType = (projectType: ?string): ChangeProjectTypeAction => ({
  type: 'project/CHANGE_TYPE',
  projectType,
});
export const changeTerm = (term: ?string): ChangeProjectTermAction => ({
  type: 'project/CHANGE_TERM',
  term,
});
export const changeTheme = (theme: ?string): ChangeProjectThemeAction => ({
  type: 'project/CHANGE_THEME',
  theme,
});

export const closeConsultationPlan = (id: string): CloseConsultationPlanAction => ({
  type: 'project/CLOSE_CONSULTATION_PLAN',
  id,
});

export const openConsultationPlan = (id: string): OpenConsultationPlanAction => ({
  type: 'project/OPEN_CONSULTATION_PLAN',
  id,
});

export const changeConsultationPlanActiveItems = (
  items: Array<string>,
): ChangeConsultationPlanActiveItemsAction => ({
  type: 'proposal/CHANGE_CONSULTATION_PLAN_ACTIVE_ITEMS',
  items,
});

export const reducer = (state: State = initialState, action: Action): Exact<State> => {
  switch (action.type) {
    case '@@INIT':
      return { ...initialState, ...state };
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
    case 'project/OPEN_CONSULTATION_PLAN': {
      const data = { ...state.showConsultationPlanById, [action.id]: true };
      LocalStorageService.set('project.showConsultationPlanById', data);
      return { ...state, showConsultationPlanById: data };
    }
    case 'project/CLOSE_CONSULTATION_PLAN': {
      const data = { ...state.showConsultationPlanById, [action.id]: false };
      LocalStorageService.set('project.showConsultationPlanById', data);
      return { ...state, showConsultationPlanById: data };
    }
    case 'proposal/CHANGE_CONSULTATION_PLAN_ACTIVE_ITEMS': {
      return { ...state, selectedActiveItems: action.items };
    }
    default:
      return state;
  }
};
