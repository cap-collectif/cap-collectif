// @flow
import * as React from 'react';
import moment from 'moment';

export type FilterType = 'startAt' | 'endAt' | 'projectId';

export type Filters = {|
  +startAt: string,
  +endAt: string,
  +projectId: string,
|};

export type Context = {|
  +filters: Filters,
  +setFilters: (key: FilterType, value: string) => void,
  +isAdmin: boolean
|};

export const DashboardPageContext: React.Context<Context> = React.createContext<Context>({
  filters: {
    startAt: moment()
      .subtract(1, 'years')
      .format('MM/DD/YYYY'),
    endAt: moment().format('MM/DD/YYYY'),
    projectId: 'ALL',
  },
  setFilters: () => {},
  isAdmin: false
});

export const useDashboard = (): Context => {
  const context = React.useContext(DashboardPageContext);
  if (!context) {
    throw new Error(
      `You can't use the useDashboardContext outsides a DashboardPageContext component.`,
    );
  }
  return context;
};
