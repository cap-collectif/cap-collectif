// @flow
import * as React from 'react';
import {
  type Action,
  createReducer,
  type ParametersState,
  type SortValues,
} from './ProjectAdminPage.reducer';
import type { Filters } from '~/components/Admin/Project/ProjectAdminPage.reducer';

const DEFAULT_SORT: SortValues = 'newest';

const DEFAULT_FILTERS: Filters = {
  state: 'PUBLISHED',
  category: 'ALL',
  district: 'ALL',
  step: null,
  status: null,
  term: null,
};

type ProviderProps = {|
  +children: React.Node,
  +firstCollectStepId: ?string
|};

export type Context = {|
  +parameters: ParametersState,
  +firstCollectStepId: ?string,
  +dispatch: Action => void,
|};

export const ProjectAdminPageContext = React.createContext<Context>({
  parameters: {
    sort: DEFAULT_SORT,
    filters: DEFAULT_FILTERS,
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
  const [parameters, dispatch] = React.useReducer<ParametersState, Action>(createReducer, {
    sort: DEFAULT_SORT,
    filters: {
      ...DEFAULT_FILTERS,
      step: firstCollectStepId
    },
  });
  const context = React.useMemo(
    () => ({
      parameters,
      firstCollectStepId,
      dispatch,
    }),
    [parameters, firstCollectStepId],
  );
  return (
    <ProjectAdminPageContext.Provider value={context}>{children}</ProjectAdminPageContext.Provider>
  );
};
