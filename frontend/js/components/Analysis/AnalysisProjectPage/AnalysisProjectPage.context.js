// @flow
import * as React from 'react';
import {
  type Action,
  createReducer,
  type ParametersState,
  type SortValues,
  STATE,
  ORDER_BY,
} from './AnalysisProjectPage.reducer';
import type { Filters } from './AnalysisProjectPage.reducer';

const DEFAULT_SORT: SortValues = ORDER_BY.NEWEST;

const DEFAULT_FILTERS: Filters = {
  state: STATE.ALL,
  district: 'ALL',
  category: 'ALL',
  analysts: null,
  supervisor: null,
  decisionMaker: null,
};

type ProviderProps = {|
  +children: React.Node,
|};

export type Context = {|
  +parameters: ParametersState,
  +dispatch: Action => void,
|};

export const AnalysisProjectPageContext = React.createContext<Context>({
  parameters: {
    sort: DEFAULT_SORT,
    filters: DEFAULT_FILTERS,
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
    <AnalysisProjectPageContext.Provider value={context}>
      {children}
    </AnalysisProjectPageContext.Provider>
  );
};
