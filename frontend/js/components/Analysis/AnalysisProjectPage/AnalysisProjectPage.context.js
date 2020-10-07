// @flow
import * as React from 'react';
import { useEffect } from 'react';
import type { AnalysisProjectPageState, Filters } from './AnalysisProjectPage.reducer';
import {
  type Action,
  type AnalysisProjectPageParameters,
  createReducer,
  ORDER_BY,
  type SortValues,
  STATE,
} from './AnalysisProjectPage.reducer';

export type AnalysisProjectPageStatus = 'ready' | 'loading';

const DEFAULT_SORT: SortValues = ORDER_BY.NEWEST;

const DEFAULT_STATUS: AnalysisProjectPageStatus = 'ready';

export const DEFAULT_FILTERS: Filters = {
  state: STATE.TODO,
  district: 'ALL',
  category: 'ALL',
  theme: 'ALL',
  analysts: [],
  supervisor: null,
  decisionMaker: null,
};

export const INITIAL_STATE = {
  status: DEFAULT_STATUS,
  sort: DEFAULT_SORT,
  filters: DEFAULT_FILTERS,
  filtersOrdered: [],
};

type ProviderProps = {|
  +children: React.Node,
|};

export type Context = {|
  +status: AnalysisProjectPageStatus,
  +parameters: AnalysisProjectPageParameters,
  +dispatch: Action => void,
|};

export const AnalysisProjectPageContext = React.createContext<Context>({
  status: DEFAULT_STATUS,
  parameters: {
    sort: DEFAULT_SORT,
    filters: DEFAULT_FILTERS,
    filtersOrdered: [],
  },
  dispatch: () => {},
});

export const useAnalysisProposalsContext = (): Context => {
  const context = React.useContext(AnalysisProjectPageContext);

  if (!context) {
    throw new Error(
      `You can't use the useAnalysisProposalsContext outside a AnalysisProposalsProvider component.`,
    );
  }
  return context;
};

export const AnalysisProposalsProvider = ({ children }: ProviderProps) => {
  const [state, dispatch] = React.useReducer<AnalysisProjectPageState, Action>(createReducer, {
    status: DEFAULT_STATUS,
    sort: DEFAULT_SORT,
    filters: DEFAULT_FILTERS,
    filtersOrdered: [],
  });
  useEffect(() => {
    dispatch({
      type: 'INIT_FILTERS_FROM_URL',
    });
  }, []);

  const context = React.useMemo(
    () => ({
      status: state.status,
      parameters: {
        sort: state.sort,
        filters: state.filters,
        filtersOrdered: state.filtersOrdered,
      },
      dispatch,
    }),
    [state],
  );

  return (
    <AnalysisProjectPageContext.Provider value={context}>
      {children}
    </AnalysisProjectPageContext.Provider>
  );
};
