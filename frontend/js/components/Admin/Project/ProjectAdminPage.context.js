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
  step: 'ALL',
  status: null,
};

type ProviderProps = {|
  +children: React.Node,
|};

export type Context = {|
  +parameters: ParametersState,
  +dispatch: Action => void,
|};

export const ProjectAdminPageContext = React.createContext<Context>({
  parameters: {
    sort: DEFAULT_SORT,
    filters: DEFAULT_FILTERS,
  },
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

export const ProjectAdminProposalsProvider = ({ children }: ProviderProps) => {
  const [parameters, dispatch] = React.useReducer<ParametersState, Action>(createReducer, {
    sort: DEFAULT_SORT,
    filters: DEFAULT_FILTERS,
  });
  const context = React.useMemo(
    () => ({
      parameters,
      dispatch,
    }),
    [parameters],
  );
  return (
    <ProjectAdminPageContext.Provider value={context}>{children}</ProjectAdminPageContext.Provider>
  );
};
