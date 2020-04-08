// @flow
import * as React from 'react';
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

const DEFAULT_FILTERS: Filters = {
  state: 'PUBLISHED',
  category: 'ALL',
  district: 'ALL',
  step: null,
  status: null,
  term: null,
};

export const ProjectAdminPageContext = React.createContext<Context>({
  status: DEFAULT_STATUS,
  parameters: {
    sort: DEFAULT_SORT,
    filters: DEFAULT_FILTERS,
    stepsChangedProposal: {
      stepsAdded: [],
      stepsRemoved: [],
    },
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

export const ProjectAdminProposalsProvider = ({ children, firstCollectStepId }: ProviderProps) => {
  const [state, dispatch] = React.useReducer<ProjectAdminPageState, Action>(createReducer, {
    status: DEFAULT_STATUS,
    sort: DEFAULT_SORT,
    filters: {
      ...DEFAULT_FILTERS,
      step: firstCollectStepId,
    },
    stepsChangedProposal: {
      stepsAdded: [],
      stepsRemoved: [],
    },
  });
  const context = React.useMemo(
    () => ({
      status: state.status,
      parameters: {
        sort: state.sort,
        filters: state.filters,
        stepsChangedProposal: state.stepsChangedProposal,
      },
      firstCollectStepId,
      dispatch,
    }),
    [state, firstCollectStepId],
  );
  return (
    <ProjectAdminPageContext.Provider value={context}>{children}</ProjectAdminPageContext.Provider>
  );
};
