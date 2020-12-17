// @flow
import * as React from 'react';
import {
  type Filters,
  type Action,
  type ProjectAdminDebatePageParameters,
  type ProjectAdminDebatePageState,
  createReducer,
} from './ProjectAdminDebatePage.reducer';

type ProviderProps = {|
  +children: React.Node,
|};

export type Context = {|
  +parameters: ProjectAdminDebatePageParameters,
  +dispatch: Action => void,
|};

export const DEFAULT_FILTERS: Filters = {
  argument: {
    type: ['FOR', 'AGAINST'],
    state: 'PUBLISHED',
  },
};

export const ProjectAdminDebatePageContext = React.createContext<Context>({
  parameters: {
    filters: DEFAULT_FILTERS,
  },
  dispatch: () => {},
});

export const useProjectAdminDebatePageContext = (): Context => {
  const context = React.useContext(ProjectAdminDebatePageContext);
  if (!context) {
    throw new Error(
      `You can't use the ProjectAdminDebatePageContext outside a ProjectAdminDebatePageProvider component.`,
    );
  }
  return context;
};

export const ProjectAdminDebatePageProvider = ({ children }: ProviderProps) => {
  const [state, dispatch] = React.useReducer<ProjectAdminDebatePageState, Action>(createReducer, {
    filters: DEFAULT_FILTERS,
  });

  const context = React.useMemo(
    () => ({
      parameters: {
        filters: state.filters,
      },
      dispatch,
    }),
    [state],
  );

  return (
    <ProjectAdminDebatePageContext.Provider value={context}>
      {children}
    </ProjectAdminDebatePageContext.Provider>
  );
};
