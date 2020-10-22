// @flow
import * as React from 'react';
import { useEffect } from 'react';
import { type Action, createReducer, type DashboardState } from './DashboardMailingList.reducer';
import type { Filters, DashboardParameters } from './DashboardMailingList.reducer';

export type DashboardStatus = 'ready' | 'loading';

type ProviderProps = {|
  +children: React.Node,
|};

export type Context = {|
  +status: DashboardStatus,
  +parameters: DashboardParameters,
  +dispatch: Action => void,
|};

const DEFAULT_STATUS: DashboardStatus = 'ready';

export const DEFAULT_FILTERS: Filters = {
  term: null,
};

export const DashboardMailingListContext = React.createContext<Context>({
  status: DEFAULT_STATUS,
  parameters: {
    filters: DEFAULT_FILTERS,
  },
  dispatch: () => {},
});

export const useDashboardCampaignContext = (): Context => {
  const context = React.useContext(DashboardMailingListContext);
  if (!context) {
    throw new Error(
      `You can't use the DashboardMailingListContext outside a DashboardMailingListProvider component.`,
    );
  }
  return context;
};

export const getInitialState = (): DashboardState => ({
  status: DEFAULT_STATUS,
  filters: DEFAULT_FILTERS,
});

export const DashboardMailingListProvider = ({ children }: ProviderProps) => {
  const [state, dispatch] = React.useReducer<DashboardState, Action>(
    createReducer,
    getInitialState(),
  );

  useEffect(() => {
    dispatch({
      type: 'INIT_FILTERS_FROM_URL',
    });
  }, []);

  const context = React.useMemo(
    () => ({
      status: state.status,
      parameters: {
        filters: state.filters,
      },
      dispatch,
    }),
    [state],
  );

  return (
    <DashboardMailingListContext.Provider value={context}>
      {children}
    </DashboardMailingListContext.Provider>
  );
};
