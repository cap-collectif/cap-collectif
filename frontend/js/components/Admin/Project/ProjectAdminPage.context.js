// @flow
import * as React from 'react';
import { useLocation } from 'react-router-dom';
import {
  type Action,
  createReducer,
  type ProjectAdminPageState,
  type SortValues,
} from './ProjectAdminPage.reducer';
import type {
  Filters,
  ProjectAdminPageParameters,
} from '~/components/Admin/Project/ProjectAdminPage.reducer';

export type ProjectAdminPageStatus = 'ready' | 'loading';

type ProviderProps = {|
  +children: React.Node,
  +firstCollectStepId: ?string,
|};

export type Context = {|
  +status: ProjectAdminPageStatus,
  +parameters: ProjectAdminPageParameters,
  +firstCollectStepId: ?string,
  +dispatch: Action => void,
|};

const DEFAULT_STATUS: ProjectAdminPageStatus = 'ready';

const DEFAULT_SORT: SortValues = 'newest';

export const DEFAULT_FILTERS: Filters = {
  state: 'PUBLISHED',
  progressState: 'ALL',
  category: 'ALL',
  theme: 'ALL',
  district: 'ALL',
  step: null,
  status: 'ALL',
  term: null,
  analysts: [],
  supervisor: null,
  decisionMaker: null,
};

export const ProjectAdminPageContext = React.createContext<Context>({
  status: DEFAULT_STATUS,
  parameters: {
    sort: DEFAULT_SORT,
    filters: DEFAULT_FILTERS,
    filtersOrdered: [],
  },
  firstCollectStepId: null,
  dispatch: () => {},
});

export const useProjectAdminProposalsContext = (): Context => {
  const context = React.useContext(ProjectAdminPageContext);
  if (!context) {
    throw new Error(
      `You can't use the ProjectAdminPageContext outside a ProjectAdminPageProvider component.`,
    );
  }
  return context;
};

export const getInitialState = (initialSelectedStep: ?string): ProjectAdminPageState => ({
  status: DEFAULT_STATUS,
  sort: DEFAULT_SORT,
  filters: {
    ...DEFAULT_FILTERS,
    step: initialSelectedStep,
  },
  filtersOrdered: [...(initialSelectedStep ? [{ id: initialSelectedStep, type: 'step' }] : [])],
  initialSelectedStep,
});

export const ProjectAdminProposalsProvider = ({ children, firstCollectStepId }: ProviderProps) => {
  const [state, dispatch] = React.useReducer<ProjectAdminPageState, Action>(
    createReducer,
    getInitialState(firstCollectStepId),
  );

  const context = React.useMemo(
    () => ({
      status: state.status,
      parameters: {
        sort: state.sort,
        filters: state.filters,
        filtersOrdered: state.filtersOrdered,
      },
      firstCollectStepId,
      dispatch,
    }),
    [state, firstCollectStepId],
  );
  const location = useLocation();

  React.useEffect(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, [dispatch, location]);

  return (
    <ProjectAdminPageContext.Provider value={context}>{children}</ProjectAdminPageContext.Provider>
  );
};
